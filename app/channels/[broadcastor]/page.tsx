import React from "react";

export default function ChannelPage({
  params,
}: {
  params: { broadcastor: string };
}) {
  const { broadcastor } = params;
  return <div>{decodeURI(broadcastor)}`&apos;`s channel</div>;
}