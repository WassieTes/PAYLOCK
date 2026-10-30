import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  FileImage,
  Hash,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  XCircle,
//   Clock,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type VerificationResult = {
  canReleaseOrder: boolean;
  status: string;
  transactionId?: string | null;
  settledAmount?: number | null;
  extractedAmount?: number | null;
  provider?: string | null;
  reason?: string | null;
  createdAt?: string;
};

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return fallback;
  }

  const message = (payload as Record<string, unknown>).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(" ");
  return fallback;
}

function formatAmount(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "Not confirmed";
  return `${amount.toLocaleString()} ETB`;
}

export default function UploadReceiptPage() {
  const [orderId, setOrderId] = useState("");
  const [expectedAmount, setExpectedAmount] = useState("");
  const [expectedReceiver, setExpectedReceiver] = useState("");
  const [manualReference, setManualReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imagePreview) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  function handleFileSelection(selectedFile: File) {
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    if (
      !ALLOWED_FILE_TYPES.includes(selectedFile.type) &&
      !(selectedFile.type === "" && extension && allowedExtensions.includes(extension))
    ) {
      setError("Choose a PNG, JPG, or WEBP image to continue.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("This image is larger than 10 MB. Choose a smaller file.");
      return;
    }

    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
    setAuthRequired(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) handleFileSelection(droppedFile);
  }

  function clearSelectedFile() {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAuthRequired(false);

    if (!file && !manualReference.trim() && !receiptUrl.trim()) {
      setError("Upload a receipt image, enter a transaction reference, or provide a receipt URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("orderId", orderId.trim());
    formData.append("expectedAmount", expectedAmount);
    formData.append("expectedReceiver", expectedReceiver.trim());
    if (manualReference.trim()) {
      formData.append("reference", manualReference.trim());
    }
    if (receiptUrl.trim()) {
      formData.append("receiptUrl", receiptUrl.trim());
    }
    if (file) formData.append("receipt", file);

    try {
      const token =
        localStorage.getItem("paylock_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/verifications/manual`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) setAuthRequired(true);
        throw new Error(
          getErrorMessage(payload, `Verification failed (HTTP ${response.status}).`),
        );
      }

      if (
        typeof payload !== "object" ||
        payload === null ||
        !("status" in payload) ||
        !("canReleaseOrder" in payload) ||
        typeof (payload as Record<string, unknown>).status !== "string" ||
        typeof (payload as Record<string, unknown>).canReleaseOrder !== "boolean"
      ) {
        throw new Error("The verification service returned an unexpected response.");
      }

      setResult(payload as VerificationResult);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to PAYLOCK. Check that the backend is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "Unable to verify this payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8F5] px-4 py-6 text-[#20372D] sm:px-7 sm:py-9">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#718077] transition hover:text-[#174D38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#174D38]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <header className="overflow-hidden rounded-3xl bg-[#174D38] px-6 py-7 text-white shadow-sm sm:px-9 sm:py-9">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#DCEBE0]">
                <ShieldCheck size={15} />
                PAYMENT SECURITY
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Verify a receipt
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
                Match the customer&apos;s payment evidence with your order and confirm the transfer before releasing goods or services.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <FileCheck2 size={21} />
              </div>
              <div>
                <p className="text-sm font-semibold">Private &amp; secure</p>
                <p className="mt-0.5 text-xs text-white/70">Up to 10 MB · PNG, JPG, WEBP</p>
              </div>
            </div>
          </div>
        </header>

        <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["01", "Enter order details"],
            ["02", "Add payment evidence"],
            ["03", "Review verification"],
          ].map(([step, label], index) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-[#E5E9E2] bg-white px-4 py-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF2EC] text-xs font-bold text-[#174D38]">
                {step}
              </span>
              <span className="text-sm font-medium text-[#526258]">{label}</span>
              {index < 2 && <ArrowRight size={14} className="ml-auto text-[#A6B0A8] sm:hidden" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          {/* Order Details Column */}
          <section className="rounded-3xl border border-[#E5E9E2] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#174D38]">
                <Banknote size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Order requirements</h2>
                <p className="mt-1 text-sm leading-5 text-[#7B887F]">
                  Enter the amount and account the customer was asked to pay.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="orderId" className="mb-1.5 block text-sm font-medium">
                  Order ID
                </label>
                <input
                  id="orderId"
                  name="orderId"
                  type="text"
                  required
                  maxLength={100}
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#E1E7E0] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
                  placeholder="e.g. ORD-1042"
                />
              </div>

              <div>
                <label htmlFor="expectedAmount" className="mb-1.5 block text-sm font-medium">
                  Expected amount <span className="text-[#829087]">(ETB)</span>
                </label>
                <div className="relative">
                  <input
                    id="expectedAmount"
                    name="expectedAmount"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={expectedAmount}
                    onChange={(event) => setExpectedAmount(event.target.value)}
                    className="w-full rounded-xl border border-[#E1E7E0] bg-white px-3.5 py-3 pr-16 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
                    placeholder="0.00"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#829087]">
                    ETB
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="expectedReceiver" className="mb-1.5 block text-sm font-medium">
                  Receiver account or phone
                </label>
                <input
                  id="expectedReceiver"
                  name="expectedReceiver"
                  type="text"
                  required
                  maxLength={100}
                  value={expectedReceiver}
                  onChange={(event) => setExpectedReceiver(event.target.value)}
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#E1E7E0] bg-white px-3.5 py-3 text-sm font-mono outline-none transition placeholder:font-sans placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
                  placeholder="Enter the merchant account"
                />
              </div>

              <div>
                <label htmlFor="manualReference" className="mb-1.5 block text-sm font-medium">
                  Transaction reference <span className="text-[#829087]">(optional)</span>
                </label>
                <input
                  id="manualReference"
                  name="reference"
                  type="text"
                  maxLength={150}
                  value={manualReference}
                  onChange={(event) => setManualReference(event.target.value)}
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#E1E7E0] bg-white px-3.5 py-3 text-sm font-mono outline-none transition placeholder:font-sans placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
                  placeholder="Enter it if visible on the receipt"
                />
                <p className="mt-1.5 text-xs leading-5 text-[#829087]">
                  If left blank, PAYLOCK will attempt OCR extraction. CBE FT lookups use the last 8 digits of the expected merchant account.
                </p>
              </div>

              <div>
                <label htmlFor="receiptUrl" className="mb-1.5 block text-sm font-medium">
                  Bank receipt URL <span className="text-[#829087]">(optional)</span>
                </label>
                <input
                  id="receiptUrl"
                  name="receiptUrl"
                  type="url"
                  value={receiptUrl}
                  onChange={(event) => setReceiptUrl(event.target.value)}
                  autoComplete="url"
                  className="w-full rounded-xl border border-[#E1E7E0] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
                  placeholder="https://…"
                />
                <p className="mt-1.5 text-xs leading-5 text-[#829087]">
                  Use this if your bank provides a receipt link or the expected account digits are unavailable.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Evidence Column */}
          <section className="flex flex-col rounded-3xl border border-[#E5E9E2] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#174D38]">
                <ImagePlus size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Payment evidence</h2>
                <p className="mt-1 text-sm leading-5 text-[#7B887F]">
                  Upload the original receipt image for automatic extraction.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                if (selectedFile) handleFileSelection(selectedFile);
                event.target.value = "";
              }}
              className="sr-only"
              aria-label="Choose receipt image"
            />

            {!imagePreview ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Choose receipt image or drop one here"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center outline-none transition focus-visible:ring-4 focus-visible:ring-[#174D38]/15 ${
                  isDragging
                    ? "border-[#174D38] bg-[#EAF2EC]"
                    : "border-[#DDE4DC] bg-[#FAFBF9] hover:border-[#8EAA96] hover:bg-[#F4F8F4]"
                }`}
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#174D38] shadow-sm">
                  <ImagePlus size={25} />
                </span>
                <span className="text-sm font-semibold text-[#294A39]">
                  Drop the receipt image here
                </span>
                <span className="mt-1 text-sm text-[#7B887F]">
                  or <span className="font-semibold text-[#174D38] underline underline-offset-2">browse files</span>
                </span>
                <span className="mt-4 rounded-full bg-white px-3 py-1.5 text-xs text-[#829087]">
                  PNG, JPG, WEBP · Maximum 10 MB
                </span>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#E5E9E2] bg-[#FAFBF9]">
                <img
                  src={imagePreview}
                  alt={`Preview of receipt ${file?.name ?? ""}`}
                  className="h-56 w-full bg-[#F0F2EE] object-contain p-2"
                />
                <div className="flex items-center gap-3 border-t border-[#E5E9E2] bg-white p-3.5">
                  <FileImage size={19} className="shrink-0 text-[#174D38]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#34483A]">{file?.name}</p>
                    <p className="text-xs text-[#829087]">
                      {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    aria-label="Remove receipt image"
                    className="rounded-lg p-2 text-[#829087] transition hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#F6F8F5] p-3.5 text-xs leading-5 text-[#718077]">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#527960]" />
              <p>
                A receipt image alone does not confirm that money arrived. Final confirmation requires authoritative verification against payment records.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#174D38] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103C2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174D38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Verifying payment…
                </>
              ) : (
                <>
                  Verify payment
                  <ArrowRight size={17} />
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-[#829087]" aria-live="polite">
              {loading
                ? "Reading receipt details and checking the payment record."
                : "You can review the result before taking action."}
            </p>
          </section>
        </form>

        {/* Global Connection / Auth Error Banner */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <CircleAlert size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Could not verify this payment</p>
              <p className="mt-1 leading-5">{error}</p>
              {authRequired && (
                <Link
                  to="/login"
                  className="mt-2 inline-flex font-semibold underline underline-offset-2"
                >
                  Sign in and try again
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Structured Result Display */}
        {result && (
          <section
            aria-live="polite"
            className={`mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm ${
              result.canReleaseOrder ? "border-[#B8D1BF]" : "border-[#EBC5C5]"
            }`}
          >
            <div
              className={`flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-7 ${
                result.canReleaseOrder ? "bg-[#EAF2EC]/70" : "bg-[#FFF5F4]"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${
                  result.canReleaseOrder ? "bg-[#174D38]" : "bg-[#B43B3B]"
                }`}
              >
                {result.canReleaseOrder ? <CheckCircle2 size={23} /> : <XCircle size={23} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718077]">
                  Verification result · {result.status.replaceAll("_", " ")}
                </p>
                <h2 className="mt-1 font-semibold text-[#20372D]">
                  {result.canReleaseOrder ? "Payment verified" : "Payment needs attention"}
                </h2>
                {result.reason && <p className="mt-1 text-sm leading-5 text-[#718077]">{result.reason}</p>}

                {result.status === "PENDING_PROVIDER" &&
                  result.reason?.includes("HTTP 404") && (
                    <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                      The provider endpoint could not be found. This is
                      different from a transaction not being found. Check
                      LINKSET_VERIFY_URL against the provider&apos;s documented
                      POST endpoint, then retry. Keep the order on hold until
                      the provider confirms the payment.
                    </p>
                  )}

                {result.status === "PENDING_PROVIDER" &&
                  result.reason?.includes("HTTP 502") && (
                    <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                      The payment provider&apos;s gateway or an upstream
                      payment service failed to return verification data. The
                      receipt scan may show an amount, but there is no
                      provider-confirmed settled amount yet. Retry later or
                      contact the provider; keep the order on hold.
                    </p>
                  )}

                {result.status === "NOT_FOUND" && (
                  <p className="mt-2 text-xs leading-5 text-[#718077]">
                    The payment provider reported that this transaction
                    reference was not found. Ensure it matches the bank SMS or
                    receipt.
                  </p>
                )}

                {result.status === "DUPLICATE_CLAIM" && (
                  <p className="mt-2 text-xs leading-5 text-red-700 font-semibold">
                    Warning: This transaction reference was already claimed
                    on another order.
                  </p>
                )}
              </div>

              <span
                className={`self-start rounded-full px-3 py-1.5 text-xs font-semibold sm:self-center ${
                  result.canReleaseOrder
                    ? "bg-[#174D38] text-white"
                    : "bg-[#F9E2E0] text-[#9A3030]"
                }`}
              >
                {result.canReleaseOrder ? "Verified" : "Do not release"}
              </span>
            </div>

            {result.extractedAmount !== null &&
              result.extractedAmount !== undefined &&
              Number.isFinite(Number(expectedAmount)) &&
              Math.abs(result.extractedAmount - Number(expectedAmount)) >= 0.01 && (
                <div className="flex items-start gap-2.5 border-b border-[#EDF0EB] bg-[#FFFBF2] px-5 py-3.5 text-sm text-[#725B38] sm:px-7">
                  <CircleAlert size={17} className="mt-0.5 shrink-0" />
                  <p className="leading-5">
                    The receipt scan found {formatAmount(result.extractedAmount)}, while this order expects {formatAmount(Number(expectedAmount))}. Use the provider&apos;s settled payment details to make the final decision.
                  </p>
                </div>
              )}

            <div className="grid gap-px bg-[#EDF0EB] sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Transaction reference",
                  value: result.transactionId || "Not detected",
                  icon: <Hash size={15} />,
                  mono: true,
                },
                {
                  label: "Settled amount",
                  value:
                    result.status === "PENDING_PROVIDER" &&
                    result.reason?.includes("HTTP 502")
                      ? "Unavailable (provider error)"
                      : formatAmount(result.settledAmount),
                  icon: <Banknote size={15} />,
                  mono: false,
                },
                {
                  label: "Receipt transfer (OCR)",
                  value: formatAmount(result.extractedAmount),
                  icon: <FileImage size={15} />,
                  mono: false,
                },
                {
                  label: "Payment provider",
                  value: result.provider ? result.provider.toUpperCase() : "Not identified",
                  icon: <ShieldCheck size={15} />,
                  mono: false,
                },
              ].map((item) => (
                <div key={item.label} className="bg-white p-4 sm:px-5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#829087]">
                    {item.icon}
                    {item.label}
                  </p>
                  <p className={`mt-2 break-all text-sm font-semibold text-[#34483A] ${item.mono ? "font-mono" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}