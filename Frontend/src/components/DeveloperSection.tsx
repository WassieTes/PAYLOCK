import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  FileCode2,
  Globe,
  Webhook,
} from "lucide-react";

const codeSamples = {
  "Node.js": `const response = await fetch(
  "https://api.paylock.et/v1/verifications",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.PAYLOCK_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      orderId: "ORDER-1042",
      amount: 2500,
      currency: "ETB",
      receiptUrl: "https://your-store.example/receipt.jpg"
    })
  }
);

const result = await response.json();
console.log(result.status);`,

  PHP: `$ch = curl_init(
  "https://api.paylock.et/v1/verifications"
);

$data = [
  "orderId" => "ORDER-1042",
  "amount" => 2500,
  "currency" => "ETB",
  "receiptUrl" => "https://your-store.example/receipt.jpg"
];

curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("PAYLOCK_API_KEY"),
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$result = json_decode($response, true);
echo $result["status"];`,
};

type Language = keyof typeof codeSamples;

export default function DeveloperSection() {
  const [language, setLanguage] = useState<Language>("Node.js");
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeSamples[language]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy code:", error);
      setCopied(false);
    }
  };

  return (
    <section
      id="developer"
      className="paylock-mesh overflow-hidden px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Left content */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-brand">
            <Code2 size={16} />
            For developers
          </span>

          <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Payment verification that fits
            <span className="text-[#557A49]"> your workflow.</span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
            Connect your ecommerce backend to PAYLOCK. Create verification
            requests, track their status, and decide when your order workflow
            can continue.
          </p>

          <div className="mt-8 space-y-5">
            {[
              {
                icon: Globe,
                title: "Works with your existing store",
                description:
                  "Integrate through your backend, whether your store uses React, Next.js, NestJS, PHP, or another stack.",
              },
              {
                icon: Webhook,
                title: "Status updates for your workflow",
                description:
                  "Use webhooks or status polling to receive verification results.",
              },
              {
                icon: FileCode2,
                title: "One merchant account",
                description:
                  "Manage your dashboard and developer credentials under the same merchant account.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-ink">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#245b37] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183b26]"
            >
              Get started
              <ArrowRight size={17} />
            </Link>

            <a
              href="#pricing"
              className="inline-flex items-center rounded-full border border-[#d9ddcf] bg-white px-6 py-3.5 text-sm font-semibold text-[#245b37] transition hover:bg-[#f0f3e9]"
            >
              Explore pricing
            </a>
          </div>
        </div>

        {/* Right code example */}
        <div
          id="api-reference"
          className="scroll-mt-24 overflow-hidden rounded-3xl border border-[#293e32] bg-[#10271c]"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#284b35] text-[#c4e0b5]">
                <Code2 size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Verification API
                </p>
                <p className="mt-0.5 text-xs text-[#9aafa0]">
                  Example integration
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#284b35] px-3 py-1 text-xs font-medium text-[#c4e0b5]">
              REST
            </span>
          </div>

          {/* Language tabs and copy button */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 sm:px-6">
            <div className="flex gap-2">
              {(Object.keys(codeSamples) as Language[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLanguage(item);
                    setCopied(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    language === item
                      ? "bg-[#dcebd3] text-[#183b26]"
                      : "text-[#a6b8aa] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#c4d2c7] transition hover:bg-white/10"
              aria-label="Copy example code"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Code display */}
          <pre className="max-h-[480px] overflow-auto p-5 text-xs leading-6 text-[#d7e4d9] sm:p-6 sm:text-sm">
            <code>{codeSamples[language]}</code>
          </pre>

          {/* Security note */}
          <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#284b35] text-[#c4e0b5]">
                <Check size={15} />
              </div>

              <p className="text-xs leading-5 text-[#a6b8aa]">
                Keep API keys on your server. This is an illustrative code
                sample; the endpoint and request format must match the
                implemented PAYLOCK backend before use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
