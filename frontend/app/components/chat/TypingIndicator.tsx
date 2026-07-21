export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2" aria-label="Guru AI sedang mengetik">
      <span className="dot h-2 w-2 rounded-full bg-navy-100" style={{ animationDelay: "0s" }} />
      <span className="dot h-2 w-2 rounded-full bg-navy-100" style={{ animationDelay: ".2s" }} />
      <span className="dot h-2 w-2 rounded-full bg-navy-100" style={{ animationDelay: ".4s" }} />
    </div>
  );
}
