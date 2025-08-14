"use client"
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
export default function Page({params}:{
    params: {
        id: string
    }
}) {
  const router = useRouter();

  router.push(`/dashboard/operations/merchant/${params.id}/business` as RouteLiteral);

  return null;
}
