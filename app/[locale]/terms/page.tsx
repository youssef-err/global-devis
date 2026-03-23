import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Global Devis',
  description: 'Terms and conditions for using our free invoice generator.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-4xl bg-white p-8 md:p-12 shadow-sm rounded-2xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600">
          <p><strong>Last Updated:</strong> March 2026</p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Global Devis Invoice Generator ("the Service"), you explicitly accept and agree to be 
            bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do 
            not use this service.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">2. Description of Service</h2>
          <p>
            Global Devis provides a decentralized, browser-based tool allowing users to natively generate, format, 
            and download standard PDF invoices. We offer this tool completely free of charge.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">3. User Responsibilities & Legal Accuracy</h2>
          <p>
            You acknowledge that the Service is provided "as is". While our calculations aim to be highly accurate, 
            you are solely responsible for ensuring the legal, mathematical, and tax accuracy of the final invoices 
            you distribute to your clients. We explicitly disclaim all liability for disputes, penalties, or damages 
            arising from incorrect use of our templating engine.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            The fundamental design, layout, graphics, and underlying source code running the Service are owned by 
            us and are protected by applicable copyright and trademark law. You may not claim ownership over the Service 
            itself, although you retain complete proprietary ownership over the specific business data and logos you 
            inject into your generated PDFs.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">5. Modifications to Service</h2>
          <p>
            We reserve the right to explicitly modify, suspend, or discontinue the Service at any time with or without 
            prior notice. We shall not be liable to you or any third party for any modification, suspension, or 
            discontinuance of the Service.
          </p>
        </div>
      </div>
    </div>
  );
}
