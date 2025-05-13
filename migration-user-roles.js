import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the database connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

async function createRolesTables() {
  try {
    console.log('Starting user roles migration...');

    // Check if the roles table already exists
    const rolesTableExists = await tableExists('roles');
    if (!rolesTableExists) {
      // Create the roles table
      await client`
        CREATE TABLE roles (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `;
      console.log('Created roles table');

      // Insert default roles
      await client`
        INSERT INTO roles (name, description) VALUES
        ('admin', 'Full access to all system functionality'),
        ('moderator', 'Can manage users, games, and content but cannot modify system settings'),
        ('content_editor', 'Can add and edit games and blog posts only'),
        ('analyst', 'View-only access to analytics and statistics');
      `;
      console.log('Inserted default roles');
    } else {
      console.log('Roles table already exists, skipping creation');
    }

    // Check if the permissions table already exists
    const permissionsTableExists = await tableExists('permissions');
    if (!permissionsTableExists) {
      // Create the permissions table
      await client`
        CREATE TABLE permissions (
          id SERIAL PRIMARY KEY,
          resource TEXT NOT NULL,
          action TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(resource, action)
        );
      `;
      console.log('Created permissions table');

      // Insert default permissions
      await client`
        INSERT INTO permissions (resource, action, description) VALUES
        ('users', 'view', 'View users'),
        ('users', 'create', 'Create users'),
        ('users', 'edit', 'Edit users'),
        ('users', 'delete', 'Delete users'),
        ('users', 'block', 'Block/unblock users'),
        
        ('games', 'view', 'View games'),
        ('games', 'create', 'Add games'),
        ('games', 'edit', 'Edit games'),
        ('games', 'delete', 'Delete games'),
        ('games', 'feature', 'Feature/unfeature games'),
        
        ('blog', 'view', 'View blog posts'),
        ('blog', 'create', 'Create blog posts'),
        ('blog', 'edit', 'Edit blog posts'),
        ('blog', 'delete', 'Delete blog posts'),
        ('blog', 'publish', 'Publish/unpublish blog posts'),
        
        ('analytics', 'view', 'View analytics'),
        
        ('settings', 'view', 'View settings'),
        ('settings', 'edit', 'Edit settings'),
        
        ('notifications', 'view', 'View notifications'),
        ('notifications', 'create', 'Create notifications'),
        ('notifications', 'edit', 'Edit notifications'),
        ('notifications', 'delete', 'Delete notifications');
      `;
      console.log('Inserted default permissions');
    } else {
      console.log('Permissions table already exists, skipping creation');
    }

    // Check if the role_permissions table already exists
    const rolePermissionsTableExists = await tableExists('role_permissions');
    if (!rolePermissionsTableExists) {
      // Create the role_permissions junction table
      await client`
        CREATE TABLE role_permissions (
          id SERIAL PRIMARY KEY,
          role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(role_id, permission_id)
        );
      `;
      console.log('Created role_permissions table');

      // Get all permissions for reference
      const permissions = await client`SELECT id, resource, action FROM permissions`;
      const permissionMap = {};
      permissions.forEach(p => {
        permissionMap[`${p.resource}_${p.action}`] = p.id;
      });

      // Get role IDs
      const roles = await client`SELECT id, name FROM roles`;
      const roleMap = {};
      roles.forEach(r => {
        roleMap[r.name] = r.id;
      });

      // Assign permissions to admin role (all permissions)
      const adminRoleId = roleMap['admin'];
      for (const permId of Object.values(permissionMap)) {
        await client`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${adminRoleId}, ${permId});
        `;
      }
      console.log('Assigned all permissions to admin role');

      // Assign permissions to moderator role
      const moderatorRoleId = roleMap['moderator'];
      const moderatorPermissions = [
        'users_view', 'users_edit', 'users_block',
        'games_view', 'games_create', 'games_edit', 'games_delete', 'games_feature',
        'blog_view', 'blog_create', 'blog_edit', 'blog_delete', 'blog_publish',
        'analytics_view',
        'notifications_view', 'notifications_create', 'notifications_edit', 'notifications_delete'
      ];
      
      for (const permKey of moderatorPermissions) {
        if (permissionMap[permKey]) {
          await client`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (${moderatorRoleId}, ${permissionMap[permKey]});
          `;
        }
      }
      console.log('Assigned permissions to moderator role');

      // Assign permissions to content_editor role
      const contentEditorRoleId = roleMap['content_editor'];
      const contentEditorPermissions = [
        'games_view', 'games_create', 'games_edit',
        'blog_view', 'blog_create', 'blog_edit',
        'analytics_view'
      ];
      
      for (const permKey of contentEditorPermissions) {
        if (permissionMap[permKey]) {
          await client`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (${contentEditorRoleId}, ${permissionMap[permKey]});
          `;
        }
      }
      console.log('Assigned permissions to content_editor role');

      // Assign permissions to analyst role
      const analystRoleId = roleMap['analyst'];
      const analystPermissions = [
        'users_view', 
        'games_view',
        'blog_view',
        'analytics_view'
      ];
      
      for (const permKey of analystPermissions) {
        if (permissionMap[permKey]) {
          await client`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (${analystRoleId}, ${permissionMap[permKey]});
          `;
        }
      }
      console.log('Assigned permissions to analyst role');
    } else {
      console.log('Role_permissions table already exists, skipping creation');
    }

    // Update users table to add role_id column if it doesn't exist
    const roleIdColumnExists = await columnExists('users', 'role_id');
    if (!roleIdColumnExists) {
      await client`
        ALTER TABLE users 
        ADD COLUMN role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL;
      `;
      console.log('Added role_id column to users table');

      // Set existing admin users to have the admin role
      const adminRoleResult = await client`SELECT id FROM roles WHERE name = 'admin'`;
      if (adminRoleResult.length > 0) {
        const adminRoleId = adminRoleResult[0].id;
        await client`
          UPDATE users 
          SET role_id = ${adminRoleId}
          WHERE is_admin = true;
        `;
        console.log('Updated existing admin users with admin role');
      }
    } else {
      console.log('Role_id column already exists in users table, skipping addition');
    }

    console.log('User roles migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.end();
  }
}

// Helper functions
async function tableExists(tableName) {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `;
  return result[0].exists;
}

async function columnExists(tableName, columnName) {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      AND column_name = ${columnName}
    );
  `;
  return result[0].exists;
}

// Run the migration function
createRolesTables();