import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Function to get or update location information from IP
async function getLocationData(req: Request) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',').shift() || 
          req.socket?.remoteAddress || '';
  
  // If testing locally, you'll get a placeholder location
  // In production, you would use a geolocation service API like ipinfo.io or MaxMind
  if (ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
    return {
      ip,
      city: 'Unknown',
      country: 'Unknown',
      latitude: 0,
      longitude: 0
    };
  }
  
  try {
    // For a real implementation, you would use an API like:
    // const response = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
    // const data = await response.json();
    // return {
    //   ip,
    //   city: data.city,
    //   country: data.country,
    //   latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : null,
    //   longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : null
    // };
    
    // For now, return placeholder data
    return {
      ip,
      city: 'Unknown',
      country: 'Unknown',
      latitude: 0,
      longitude: 0
    };
  } catch (error) {
    console.error('Error getting location data:', error);
    return {
      ip,
      city: 'Unknown',
      country: 'Unknown',
      latitude: 0,
      longitude: 0
    };
  }
}

async function findOrCreateSocialUser(
  profile: any, 
  accountType: 'google' | 'facebook',
  req: Request
): Promise<SelectUser> {
  const socialId = profile.id;
  const existingUser = await storage.getUserBySocialId(socialId);
  
  if (existingUser) {
    // Update last login time
    await storage.updateUserLastLogin(existingUser.id);
    return existingUser;
  }
  
  // Extract data from profile based on provider
  let email = null;
  let firstName = null;
  let lastName = null;
  let profilePicture = null;
  
  if (accountType === 'google') {
    email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    firstName = profile.name?.givenName;
    lastName = profile.name?.familyName;
    profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
  } else if (accountType === 'facebook') {
    email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    firstName = profile.name?.givenName;
    lastName = profile.name?.familyName;
    profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
  }
  
  // Check if user with same email already exists
  let user = email ? await storage.getUserByEmail(email) : null;
  
  if (user) {
    // Update existing user with social id
    user = await storage.updateUser(user.id, {
      socialId,
      accountType,
      lastLogin: new Date(),
      updatedAt: new Date()
    });
    return user;
  }
  
  // Get location data
  const location = await getLocationData(req);
  
  // Create new user
  const username = email ? email.split('@')[0] + '_' + accountType : socialId;
  
  const newUser = await storage.createUser({
    username,
    email,
    socialId,
    accountType,
    profilePicture,
    bio: null,
    country: null,
    isAdmin: false,
    status: 'active',
    lastLogin: new Date(),
    location
  });
  
  return newUser;
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    console.warn("No SESSION_SECRET environment variable set, using a default insecure secret");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "gamezone_insecure_session_secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // If user does not exist
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // If user was created using social login
        if (user.accountType && user.accountType !== 'local') {
          return done(null, false, { message: 'Please login with your social account' });
        }
        
        // Check if user is blocked
        if (user.status === 'blocked') {
          return done(null, false, { message: 'Account is blocked. Please contact support.' });
        }
        
        // Special case for admin user with plaintext password (temporary for demo)
        if (username === 'admin' && password === user.password) {
          await storage.updateUserLastLogin(user.id);
          return done(null, user);
        } else if (username !== 'admin') {
          // For regular users, check hashed passwords
          if (!user.password || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid username or password" });
          }
        } else {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Update last login time
        await storage.updateUserLastLogin(user.id);
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );
  
  // Google OAuth strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
          passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const user = await findOrCreateSocialUser(profile, 'google', req);
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  } else {
    console.warn('Google OAuth credentials not set. Google login will not be available.');
  }
  
  // Facebook OAuth strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: '/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
          passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const user = await findOrCreateSocialUser(profile, 'facebook', req);
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  } else {
    console.warn('Facebook OAuth credentials not set. Facebook login will not be available.');
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      
      // If user no longer exists or is blocked
      if (!user) {
        return done(null, false);
      }
      if (user.status === 'blocked') {
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, profilePicture, bio, country } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Get location data from request
      const location = await getLocationData(req);
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        profilePicture,
        bio,
        country,
        accountType: 'local',
        socialId: null,
        isAdmin: false, // Default to non-admin user
        status: 'active',
        lastLogin: new Date(),
        location
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      console.error('Error during registration:', error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    // Development mode: provide mock admin user when database is unavailable
    if (process.env.NODE_ENV === 'development' && !req.isAuthenticated()) {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@gamezone.com',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        accountType: 'local',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      };
      return res.json(mockUser);
    }
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
  
  // Middleware to check admin role
  app.use('/api/admin/*', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  });
  
  // Social login routes - Google
  app.get('/api/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  }));
  
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/auth' 
    }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/');
    }
  );
  
  // Social login routes - Facebook
  app.get('/api/auth/facebook', passport.authenticate('facebook', { 
    scope: ['email'] 
  }));
  
  app.get('/api/auth/facebook/callback', 
    passport.authenticate('facebook', { 
      failureRedirect: '/auth' 
    }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/');
    }
  );
  
  // Update user profile
  app.put('/api/user/profile', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { bio, country, profilePicture, displayName, username, email } = req.body;
      const userId = req.user.id;
      
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (bio !== undefined) updateData.bio = bio;
      if (country !== undefined) updateData.country = country;
      if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
      if (displayName !== undefined) updateData.displayName = displayName;
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  });
  
  // Admin routes for user management
  app.get('/api/admin/users', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const { status = 'active', page = 1, limit = 10 } = req.query;
      const validStatus = status === 'blocked' ? 'blocked' : 'active';
      
      const result = await storage.getUsersByStatus(validStatus, {
        page: Number(page),
        limit: Number(limit)
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  // API to block/unblock user
  app.put('/api/admin/users/:id/status', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const userId = Number(req.params.id);
      const { status } = req.body;
      
      if (status !== 'active' && status !== 'blocked') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Prevent blocking oneself
      if (userId === req.user.id && status === 'blocked') {
        return res.status(400).json({ message: "Cannot block your own account" });
      }
      
      const updatedUser = await storage.updateUserStatus(userId, status);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ message: 'Failed to update user status' });
    }
  });
  
  // API to get user stats for admin dashboard
  app.get('/api/admin/user-stats', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const stats = await storage.getUserStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
  });
  
  // API to get user distribution by country
  app.get('/api/admin/users/countries', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const countryData = await storage.getUsersByCountry();
      return res.json(countryData);
    } catch (error) {
      console.error('Error fetching user country data:', error);
      return res.status(500).json({ message: 'Failed to fetch user country data' });
    }
  });
  
  // API to get new user signups over time
  app.get('/api/admin/users/new', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    try {
      const { days = 30 } = req.query;
      const newUsers = await storage.getNewUsers(Number(days));
      return res.json(newUsers);
    } catch (error) {
      console.error('Error fetching new user data:', error);
      return res.status(500).json({ message: 'Failed to fetch new user data' });
    }
  });
}
