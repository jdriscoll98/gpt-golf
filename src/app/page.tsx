import dynamic from 'next/dynamic';
const Upload = dynamic(() => import('@/components/upload'), {
  ssr: false
})
export default function Home() {
  return <Upload />;
}
