export default function InputError({ message }: { message: string | null }) {
  return <p className="text-sm text-red-500">{message}</p>;
}
