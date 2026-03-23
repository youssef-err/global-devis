import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Global Devis',
  description: 'Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-4xl bg-white p-8 md:p-12 shadow-sm rounded-2xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600">
          <p><strong>Last Updated:</strong> March 2026</p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            When you use our Free Invoice Generator, the data you enter (such as your business name, client details, 
            and financial figures) is processed entirely locally within your web browser. We do not store, 
            transmit, or save your generated invoices on our remote servers.
          </p>
          <p>
            We may passively collect non-personally identifiable information, such as browser type, device type, 
            and operating system, purely for analytical purposes to improve our services.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">2. Use of Cookies & Local Storage</h2>
          <p>
            We use browser Local Storage to save your invoice drafts so you do not lose your progress if you close the tab. 
            We also use cookies and similar tracking technologies to analyze traffic securely and serve personalized advertisements.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">3. Third-Party Advertising (Google AdSense)</h2>
          <p>
            We use Google AdSense to display advertisements on our website. Google, as a third-party vendor, uses cookies 
            to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies 
            enables it and its partners to serve ads to our users. 
          </p>
          <p>
            You may explicitly opt out of personalized advertising by visiting the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Ads Settings</a>.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">4. GDPR and CCPA Compliance</h2>
          <p>
            If you are located in the European Economic Area (EEA), you have explicit rights to access, rectify, or erase 
            any personal data we might hold. However, because our core invoice generation service operates locally, we 
            inherently do not possess a database of your invoices to begin with. You have complete control over your 
            cookie preferences via the consent banner available upon your first visit.
          </p>
        </div>
      </div>
    </div>
  );
}
