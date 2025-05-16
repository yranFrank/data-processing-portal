
# 🌐 Data Processing Portal

This is a [Next.js](https://nextjs.org) project designed to efficiently extract and process data from multiple URLs with customizable field selection. The project is built with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Live Demo
🔗 Data Processing Portal - Live Demo https://data-processing-portal-9tlj.vercel.app/

## 🚀 Getting Started

First, clone the repository:

```bash
git clone https://github.com/your-username/data-processing-portal.git
cd data-processing-portal
```

### Install Dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```
### Configure Environment Variables:

Create a .env.local file in the root directory.

Add your OpenAI API Key:

```bash
OPENAI_API_KEY=your-openai-api-key

```

### Run the Development Server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

---

## 📌 Supported Websites

- ✅ Coles
- ✅ Target
- ✅ Kmart
- ⚠️ Woolworths (Price not accessible)
- ✅ IKEA

---

## ✨ Features

- 🌐 Multi-URL Processing: Extract data from multiple URLs in one go.
- 💡 Customizable Fields: Specify the data fields you want to extract (e.g., name, price, description).
- 📊 CSV Export: Download processed data as a CSV file.
- 📌 Real-time Preview: View extracted data before downloading.
- 🔒 Secure Processing: Data processed directly in the browser.

---

## 📄 How It Works

- Enter one or more URLs (one per line).
- Specify the data fields you want (e.g., `name, price, description`).
- Click the "🚀 Start Processing" button.
- View the extracted data in the preview section.
- Click 📥 "Download Processed CSV" to save the results.

---

## 🌐 Deployment

### Deploying on Vercel

The easiest way to deploy this project is to use [Vercel Platform](https://vercel.com/):

1. Connect your GitHub repository to Vercel.
2. Set your `OPENAI_API_KEY` in the Vercel environment settings.
3. Deploy the `main` branch.

### Custom Domain Setup (Optional)

- Add your custom domain in the Vercel dashboard.
- Update your DNS settings to point to Vercel.

---

## 🛠 Project Structure

```bash
src/app/
├── api/process/route.ts   # API route for processing URLs
├── page.tsx               # Main user interface
├── layout.tsx             # Layout component with background video
├── globals.css            # Global styling
public/
├── background.mp4         # Background video
├── favicon.ico            # Site favicon
```

---

## ⚠️ Known Issues

- Woolworths: Prices may not be accessible.
- If the user requests vague fields (e.g., "description"), the app will prompt for more specific information.

---

## 📌 Future Improvements

- Add support for more websites.
- Enhance data extraction accuracy with fine-tuned OpenAI models.
- Add user authentication for advanced features.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## ✨ Contributors

- **Frank Ran** - [GitHub Profile](https://github.com/yranFrank)

Feel free to contribute and improve this project. 🙂
