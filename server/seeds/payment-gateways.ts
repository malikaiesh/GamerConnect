import { db } from "../../db";
import { paymentGateways } from "@shared/schema";
import { count } from "drizzle-orm";

// Default payment gateways with comprehensive international and local options
const defaultGateways = [
  // International Automated Gateways
  {
    name: "stripe-main",
    displayName: "Stripe",
    gatewayType: "stripe" as const,
    methodType: "automated" as const,
    status: "disabled" as const,
    description: "Leading global payment processor supporting 46+ countries with excellent developer experience",
    logo: "/assets/payment-logos/stripe.svg",
    sortOrder: 100,
    isTestMode: true,
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
    minimumAmount: 50, // $0.50
    maximumAmount: 99999999, // $999,999.99
    processingFee: 290, // 2.9%
    paymentInstructions: "",
    apiConfiguration: {
      publicKey: "pk_test_sample_key_for_testing_only",
      secretKey: "sk_test_sample_secret_for_testing_only",
      webhookSecret: "whsec_sample_webhook_secret_for_testing",
      sandboxApiKey: "pk_test_sample_sandbox_key",
      sandboxSecretKey: "sk_test_sample_sandbox_secret"
    },
    accountDetails: null
  },
  {
    name: "paypal-main",
    displayName: "PayPal",
    gatewayType: "paypal" as const,
    methodType: "automated" as const,
    status: "disabled" as const,
    description: "Worldwide trusted payment platform with buyer protection and easy checkout",
    logo: "/assets/payment-logos/paypal.svg",
    sortOrder: 90,
    isTestMode: true,
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
    minimumAmount: 100, // $1.00
    maximumAmount: 1000000000, // $10,000,000.00
    processingFee: 349, // 3.49%
    paymentInstructions: "",
    apiConfiguration: {
      apiKey: "sample_paypal_client_id_for_testing",
      secretKey: "sample_paypal_client_secret_for_testing",
      merchantId: "sample_merchant_id",
      webhookSecret: "sample_webhook_secret",
      sandboxApiKey: "sandbox_client_id_for_testing",
      sandboxSecretKey: "sandbox_client_secret_for_testing"
    },
    accountDetails: null
  },
  {
    name: "razorpay-main",
    displayName: "Razorpay",
    gatewayType: "razorpay" as const,
    methodType: "automated" as const,
    status: "disabled" as const,
    description: "India's leading payment gateway with support for UPI, cards, net banking, and wallets",
    logo: "/assets/payment-logos/razorpay.svg",
    sortOrder: 80,
    isTestMode: true,
    supportedCurrencies: ["INR", "USD"],
    minimumAmount: 100, // ₹1.00
    maximumAmount: 1500000000, // ₹15,000,000.00
    processingFee: 200, // 2.0%
    paymentInstructions: "",
    apiConfiguration: {
      apiKey: "rzp_test_sample_key_id_for_testing",
      secretKey: "sample_razorpay_secret_for_testing",
      webhookSecret: "sample_webhook_secret_for_testing"
    },
    accountDetails: null
  },
  {
    name: "flutterwave-main",
    displayName: "Flutterwave",
    gatewayType: "flutterwave" as const,
    methodType: "automated" as const,
    status: "disabled" as const,
    description: "Africa's leading payment processor supporting mobile money and local payment methods",
    logo: "/assets/payment-logos/flutterwave.svg",
    sortOrder: 70,
    isTestMode: true,
    supportedCurrencies: ["NGN", "KES", "ZAR", "GHS", "UGX", "TZS", "USD"],
    minimumAmount: 100, // ₦1.00
    maximumAmount: 50000000, // ₦500,000.00
    processingFee: 150, // 1.5%
    paymentInstructions: "",
    apiConfiguration: {
      publicKey: "",
      secretKey: "",
      webhookSecret: ""
    },
    accountDetails: null
  },
  {
    name: "mollie-main",
    displayName: "Mollie",
    gatewayType: "mollie" as const,
    methodType: "automated" as const,
    status: "disabled" as const,
    description: "European payment processor with excellent SEPA support and local payment methods",
    logo: "/assets/payment-logos/mollie.svg",
    sortOrder: 60,
    isTestMode: true,
    supportedCurrencies: ["EUR", "GBP", "USD"],
    minimumAmount: 100, // €1.00
    maximumAmount: 1000000, // €10,000.00
    processingFee: 280, // 2.8%
    paymentInstructions: "",
    apiConfiguration: {
      apiKey: "",
      webhookSecret: ""
    },
    accountDetails: null
  },
  {
    name: "square-main",
    displayName: "Square",
    gatewayType: "square" as const,
    methodType: "automated" as const,
    status: "disabled" as const,
    description: "Comprehensive payment solution popular in US/Canada with easy integration",
    logo: "/assets/payment-logos/square.svg",
    sortOrder: 50,
    isTestMode: true,
    supportedCurrencies: ["USD", "CAD"],
    minimumAmount: 100, // $1.00
    maximumAmount: 50000000, // $500,000.00
    processingFee: 290, // 2.9%
    paymentInstructions: "",
    apiConfiguration: {
      apiKey: "",
      secretKey: "",
      merchantId: ""
    },
    accountDetails: null
  },
  
  // Manual Payment Methods
  {
    name: "bank-transfer-usa",
    displayName: "US Bank Transfer",
    gatewayType: "manual" as const,
    methodType: "manual" as const,
    status: "disabled" as const,
    description: "Direct bank transfer for US customers with ACH processing",
    logo: "/assets/payment-logos/bank-transfer.svg",
    sortOrder: 40,
    isTestMode: false,
    supportedCurrencies: ["USD"],
    minimumAmount: 1000, // $10.00
    maximumAmount: 100000000, // $1,000,000.00
    processingFee: 0,
    paymentInstructions: "Please use the following bank details for wire transfers. Include your order ID in the reference.",
    apiConfiguration: null,
    accountDetails: {
      bankName: "First National Bank",
      accountNumber: "1234567890",
      routingNumber: "123456789",
      swiftCode: "FNBXUS33",
      beneficiaryName: "Your Company Name",
      additionalInfo: "Please include your order ID as the payment reference"
    }
  },
  {
    name: "bank-transfer-eu",
    displayName: "EU Bank Transfer (SEPA)",
    gatewayType: "manual" as const,
    methodType: "manual" as const,
    status: "disabled" as const,
    description: "SEPA bank transfer for European Union customers",
    logo: "/assets/payment-logos/sepa.svg",
    sortOrder: 35,
    isTestMode: false,
    supportedCurrencies: ["EUR"],
    minimumAmount: 500, // €5.00
    maximumAmount: 100000000, // €1,000,000.00
    processingFee: 0,
    paymentInstructions: "Transfer money using SEPA. Processing takes 1-3 business days.",
    apiConfiguration: null,
    accountDetails: {
      bankName: "Deutsche Bank",
      accountNumber: "DE12345678901234567890",
      swiftCode: "DEUTDEFF",
      beneficiaryName: "Your Company EU",
      additionalInfo: "SEPA transfers are processed within 1-3 business days"
    }
  },
  {
    name: "mobile-money-africa",
    displayName: "Mobile Money (Africa)",
    gatewayType: "manual" as const,
    methodType: "manual" as const,
    status: "disabled" as const,
    description: "M-Pesa, MTN Mobile Money, and other African mobile money services",
    logo: "/assets/payment-logos/mobile-money.svg",
    sortOrder: 30,
    isTestMode: false,
    supportedCurrencies: ["KES", "UGX", "TZS", "GHS"],
    minimumAmount: 100, // KES 1.00
    maximumAmount: 70000000, // KES 700,000.00
    processingFee: 100, // 1.0%
    paymentInstructions: "Send money via M-Pesa or MTN Mobile Money to the number provided. Use your order ID as reference.",
    apiConfiguration: null,
    accountDetails: {
      additionalInfo: "M-Pesa: +254XXXXXXXXX | MTN: +256XXXXXXXXX | Please use order ID as reference"
    }
  },
  {
    name: "cryptocurrency",
    displayName: "Cryptocurrency",
    gatewayType: "manual" as const,
    methodType: "manual" as const,
    status: "disabled" as const,
    description: "Bitcoin, Ethereum, and USDT payments with manual verification",
    logo: "/assets/payment-logos/crypto.svg",
    sortOrder: 25,
    isTestMode: false,
    supportedCurrencies: ["BTC", "ETH", "USDT"],
    minimumAmount: 1000, // $10.00 equivalent
    maximumAmount: 1000000000, // $10,000,000.00 equivalent
    processingFee: 0,
    paymentInstructions: "Send cryptocurrency to the provided address. Include transaction hash as proof of payment.",
    apiConfiguration: null,
    accountDetails: {
      cryptoAddress: "Bitcoin: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      additionalInfo: "Ethereum: 0x742d35Cc6634C0532925a3b8D6Ac6d9b9a0e1e87 | USDT (ERC20): Same as Ethereum address"
    }
  },
  {
    name: "wire-transfer-international",
    displayName: "International Wire Transfer",
    gatewayType: "manual" as const,
    methodType: "manual" as const,
    status: "disabled" as const,
    description: "Traditional wire transfer for large international payments",
    logo: "/assets/payment-logos/wire-transfer.svg",
    sortOrder: 20,
    isTestMode: false,
    supportedCurrencies: ["USD", "EUR", "GBP"],
    minimumAmount: 50000, // $500.00
    maximumAmount: 1000000000, // $10,000,000.00
    processingFee: 2500, // $25.00 flat fee
    paymentInstructions: "Wire transfer details will be provided after order confirmation. Processing takes 3-5 business days.",
    apiConfiguration: null,
    accountDetails: {
      bankName: "Chase Bank",
      accountNumber: "9876543210",
      routingNumber: "021000021",
      swiftCode: "CHASUS33",
      beneficiaryName: "Your Company International",
      additionalInfo: "Wire transfers typically take 3-5 business days. $25 processing fee applies."
    }
  },
  {
    name: "payment-voucher",
    displayName: "Payment Vouchers",
    gatewayType: "manual" as const,
    methodType: "manual" as const,
    status: "disabled" as const,
    description: "Prepaid vouchers and gift cards for manual redemption",
    logo: "/assets/payment-logos/voucher.svg",
    sortOrder: 15,
    isTestMode: false,
    supportedCurrencies: ["USD", "EUR"],
    minimumAmount: 500, // $5.00
    maximumAmount: 10000000, // $100,000.00
    processingFee: 500, // 5.0%
    paymentInstructions: "Purchase vouchers from authorized retailers or our website. Submit voucher code for manual verification.",
    apiConfiguration: null,
    accountDetails: {
      additionalInfo: "Vouchers available at: 7-Eleven, CVS, authorized online retailers"
    }
  }
];

export async function seedPaymentGateways() {
  try {
    // Check if payment gateways already exist
    const existingCount = await db
      .select({ count: count() })
      .from(paymentGateways);

    if (existingCount[0].count > 0) {
      console.log('ℹ️  Payment gateways already exist, skipping seeding');
      return;
    }

    // Insert default payment gateways
    await db.insert(paymentGateways).values(
      defaultGateways.map(gateway => ({
        ...gateway,
        createdBy: 1, // Admin user
        updatedBy: 1
      }))
    );

    console.log(`✅ Seeded ${defaultGateways.length} payment gateways successfully`);
  } catch (error) {
    console.error('❌ Error seeding payment gateways:', error);
    throw error;
  }
}