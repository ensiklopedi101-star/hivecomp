import { permanentRedirect } from "next/navigation";

export default function PrivacyRedirect() {
  permanentRedirect("/kebijakan#privasi");
}
