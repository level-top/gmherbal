import Link from "next/link";

function IconWhatsapp(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M8.3 9.1c.3-.7.6-.8 1.1-.8h.6c.2 0 .4 0 .6.4l.8 1.9c.1.3.1.6-.1.8l-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9.9.8 1.7 1.1 2 .9.3-.2.5-.6.7-.8.2-.2.4-.2.7-.1l1.7.8c.6.3.6.5.5 1-.1.5-.6 1.5-1.8 1.7-1.3.2-2.9-.4-4.6-2-1.6-1.5-2.6-3.4-2.6-4.7 0-.9.3-1.6.4-1.9Z" />
    </svg>
  );
}

export function WhatsappButton({
  phoneE164NoPlus,
  defaultText,
}: {
  phoneE164NoPlus: string;
  defaultText: string;
}) {
  const url = `https://wa.me/${phoneE164NoPlus}?text=${encodeURIComponent(defaultText)}`;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-whatsapp-hover focus:outline-none focus:ring-2 focus:ring-leaf focus:ring-offset-2"
      aria-label="Contact on WhatsApp"
    >
      <IconWhatsapp className="h-5 w-5" />
      WhatsApp
    </Link>
  );
}
