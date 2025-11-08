#!/usr/bin/env node

/**
 * Setup script for Stripe webhooks in development
 * This script helps configure Stripe CLI for local webhook testing
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

console.log('🚀 Setting up Stripe webhooks for development...\n')

const isWindows = os.platform() === 'win32'

try {
  // Check if Stripe CLI is installed
  console.log('📦 Checking Stripe CLI installation...')
  try {
    execSync('stripe --version', { stdio: 'pipe' })
    console.log('✅ Stripe CLI is installed\n')
  } catch (error) {
    console.log('❌ Stripe CLI is not installed\n')
    console.log('🔧 Installing Stripe CLI...\n')

    if (isWindows) {
      console.log('📥 Installing Stripe CLI for Windows...')
      console.log('   Option 1 - Using winget (recommended):')
      console.log('   winget install --id Stripe.StripeCLI')
      console.log('')
      console.log('   Option 2 - Manual download:')
      console.log('   1. Visit: https://github.com/stripe/stripe-cli/releases/latest')
      console.log('   2. Download: stripe_windows_amd64.zip')
      console.log('   3. Extract zip file to a folder (e.g., C:\\stripe-cli)')
      console.log('   4. Add the folder to your PATH environment variable')
      console.log('')
      console.log('   Option 3 - Using Chocolatey (if you have it):')
      console.log('   choco install stripe-cli')
      console.log('')
    } else {
      console.log('   macOS: brew install stripe/stripe-cli/stripe')
      console.log('   Linux: Download from https://stripe.com/docs/stripe-cli')
      console.log('')
    }

    console.log('After installation, run this command again: npm run webhooks\n')
    process.exit(1)
  }

  // Login to Stripe (if not already logged in)
  console.log('🔐 Logging into Stripe CLI...')
  console.log('   A browser window will open for authentication\n')
  try {
    execSync('stripe login', { stdio: 'inherit' })
    console.log('✅ Successfully logged into Stripe\n')
  } catch (error) {
    console.log('⚠️  Stripe login may have failed or was cancelled.')
    console.log('   Please run "stripe login" manually and then restart this script.\n')
    process.exit(1)
  }

  // Start webhook forwarding
  console.log('🔄 Starting webhook forwarding to localhost:3000...')
  console.log('📝 Copy the webhook signing secret from the CLI output below')
  console.log('📝 Add it to your .env.local file as STRIPE_WEBHOOK_SECRET\n')

  console.log('💡 Next steps:')
  console.log('1. Copy the webhook signing secret from CLI output')
  console.log('2. Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...')
  console.log('3. Start your dev server in another terminal: npm run dev')
  console.log('4. Test payments - webhooks will be forwarded automatically\n')

  console.log('🔗 Webhook forwarding starting...\n')

  // Start the listener
  execSync('stripe listen --forward-to localhost:3000/api/stripe-webhook', {
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  })

} catch (error) {
  console.error('❌ Error setting up webhooks:')
  console.error(error.message)
  console.log('\n🔧 Manual setup instructions:')
  console.log('1. Install Stripe CLI: https://stripe.com/docs/stripe-cli')
  console.log('2. Run: stripe login')
  console.log('3. Run: stripe listen --forward-to localhost:3000/api/stripe-webhook')
  console.log('4. Copy webhook secret to .env.local')
  console.log('5. Start dev server: npm run dev')
  process.exit(1)
}