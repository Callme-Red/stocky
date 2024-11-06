import { Back } from "../icons/icons";

export default function SubHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center">
      <Back />
      <h2 className="ml-4 text-lg font-semibold text-secondary">{title}</h2>
    </header>
  );
}
