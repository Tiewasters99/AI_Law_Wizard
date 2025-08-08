# AI Wizard - Legal Consultation Platform

A Next.js application that provides AI-powered legal consultation using Grok API.

## Features

- 🤖 **AI-Powered Chat**: Real-time legal consultation with Grok 4
- 💬 **Chat Interface**: Modern chat UI
- 💎 **Subscription Tiers**: Silver, Gold, and Platinum plans
- 🔒 **Chat Limits**: Free tier with upgrade prompts
- 📱 **Responsive Design**: Works on all devices

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Grok API Configuration
GROK_API_KEY=your_actual_grok_api_key_here
```

**To get your Grok API key:**
1. Visit [https://console.x.ai/](https://console.x.ai/)
2. Sign up or log in to your account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The application uses the Grok API for AI-powered legal consultation:

### Chat API Endpoint
- **URL**: `/api/chat`
- **Method**: POST
- **Body**: 
  ```json
  {
    "message": "Your legal question"
  }
  ```

### Grok API Configuration
- **Model**: `grok-4-latest`
- **Temperature**: 0.7
- **Streaming**: Disabled
- **System Prompt**: Legal assistant with professional advice

## Subscription Tiers

### Free Tier
- 4 free chats per session
- Basic legal consultation
- Upgrade prompts after limit

### Silver Plan ($9.99/month)
- 50 chats per month
- Basic legal consultation
- Email support

### Gold Plan ($19.99/month) - Most Popular
- 200 chats per month
- Advanced legal consultation
- Priority support
- Legal document templates

### Platinum Plan ($39.99/month)
- 1000 chats per month
- Premium consultation
- 24/7 phone support
- API access

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── upgrade/       # Upgrade API endpoint
│   ├── chat/              # Chat page
│   ├── components/
│   │   ├── ui/            # UI components
│   │   ├── consultation/  # Consultation components
│   │   └── UpgradeModal.tsx
│   └── lib/
│       ├── api.ts         # API functions
│       └── pricing.ts     # Pricing configuration
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Grok API** - AI-powered responses
- **Lucide React** - Icons

## Development

### Adding New Features
1. Create components in `src/app/components/`
2. Add API routes in `src/app/api/`
3. Update types in `src/app/lib/`

### Testing
```bash
npm run build
npm start
```

## Deployment

1. Set up environment variables in your hosting platform
2. Build the application: `npm run build`
3. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## Support

For issues or questions:
1. Check the console for error messages
2. Verify your API key is correct
3. Ensure all environment variables are set

### Common Issues

**403 Error - No Credits:**
- Visit https://console.x.ai/ to purchase credits
- New accounts need to add credits before using the API

**401 Error - Invalid API Key:**
- Ensure your API key starts with "Bearer " (the code adds this automatically)
- Check that your `.env.local` file is in the root directory
- Restart the development server after adding the API key

**429 Error - Rate Limit:**
- Wait a few minutes before trying again
- Consider upgrading your plan for higher limits

## License

This project is for educational and development purposes.
