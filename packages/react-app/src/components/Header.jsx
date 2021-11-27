import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://www.instagram.com/mad.latam/?hl=es" target="_blank" rel="noopener noreferrer">
      <PageHeader title="🏗 MADLatam" subTitle="🖼 NFT MarketPlace" style={{ cursor: "pointer" }} />
    </a>
  );
}
