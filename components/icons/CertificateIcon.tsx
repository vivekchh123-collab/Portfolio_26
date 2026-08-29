export default function CertificateIcon({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Certificate Frame */}
      <rect x="5" y="10" width="90" height="60" rx="6" />
      {/* Inner Lines */}
      <rect x="15" y="20" width="50" height="4" fill="white" />
      <rect x="15" y="30" width="38" height="3" fill="white" />
      <rect x="15" y="38" width="38" height="3" fill="white" />
      <rect x="15" y="46" width="38" height="3" fill="white" />
      {/* Signature scribble */}
      <path
        d="M 28 58 Q 32 54 36 58 T 44 58 T 50 56"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Badge Ribbon */}
      <polygon points="68,75 75,98 82,88 89,98 96,75" />
      {/* Badge Rosette */}
      <circle
        cx="82"
        cy="62"
        r="16"
        fill="currentColor"
        stroke="white"
        strokeWidth="2.5"
      />
    </svg>
  );
}
