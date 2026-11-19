import { LABEL_COLOR, Label } from "@/lib/rules";
export default function Tag({ label }: { label: Label }) {
  return <span className="tag" style={{ background: LABEL_COLOR[label] }}>{label}</span>;
}
