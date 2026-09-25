import { cn } from "./cn";

// Полоса-шарф в цветах WKS Śląsk (зелёный / белый / красный). Единственное
// место, где фирменные цвета клуба появляются в полную силу — фоны ими не
// заливаем (см. styles/tokens.css).
export default function ScarfStripe({ className }: { className?: string }) {
  return <div className={cn("scarf h-6 w-full", className)} aria-hidden="true" />;
}
