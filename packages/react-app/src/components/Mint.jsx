import React from "react";
import { Button, Input, Tooltip, Form, InputNumber, Upload, message } from "antd";
import { AddressInput } from ".";

export default function Mint(props) {
  const [mintTo, setMintTo] = React.useState();
  const [ipfsHash, setIpfsHash] = React.useState();
  const [ipfsHashPic, setIpfsHashPic] = React.useState();
  const [ipfsHashNFT, setIpfsHashNFT] = React.useState();
  const [sending, setSending] = React.useState();
  const [sendingPic, setSendingPic] = React.useState();
  const [sendingMint, setSendingMint] = React.useState();
  const [disabled, setDisabled] = React.useState(true);
  const [web3, setWeb3] = React.useState();
  const [buffer, setBuffer] = React.useState();
  const writeContracts = props.writeContracts;

  const ipfsAPI = require("ipfs-api");
  const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };
  const validateMessages = {
    required: "Se necesita ${label}",
  };
  const onFinish = async(values)   => {
    const jsonNFT = {
        description: values.user["descripcion"],
        name: values.user["nombre"],
        image: ipfsHashPic
    }
    console.log("UPLOADING...", jsonNFT.name);
    setSending(true);
    setIpfsHashNFT();
    const NFT_string = JSON.stringify(jsonNFT);
    const result = await ipfs.add(Buffer.from(NFT_string));
    if (result && result.path) {
      console.log(result.path);
    }
    setIpfsHashNFT("https://ipfs.io/ipfs/" + result[0].path);
    setSending(false);
    console.log("RESULT:", result);
  };
  function captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
      setDisabled(false);
      console.log("buffer", buffer);
      console.log(buffer);
    };
  }
  const saveImageOnIpfs = async () => {
    console.log("UPLOADING...", Buffer.from(buffer));
    setSendingPic(true);
    setIpfsHashPic();
    const result = await ipfs.files.add(buffer);
    if (result && result.path) {
      console.log(ipfsHashPic);
    }
    setIpfsHashPic("https://ipfs.io/ipfs/" + result[0].path);
    setSendingPic(false);
    console.log("RESULT:", result[0].path);
  };

  return (
    <div>
      <fieldset>
        <legend>Subir su imagen</legend>
        <input type="file" name="photo" id="photo" onChange={captureFile}></input>
        <Button
          style={{ margin: 8 }}
          loading={sendingPic}
          size="large"
          shape="round"
          type="primary"
          onClick={saveImageOnIpfs}
          disabled={disabled}
        >
          Cargar
        </Button>
      </fieldset>
      <div>{ipfsHashPic}</div>
      <br />
      {ipfsHashPic && (
        <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
          <Form.Item name={["user", "nombre"]} label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["user", "descripcion"]} label="Descripcion" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
            <Button type="primary" htmlType="submit">
              Subir a IPFS
            </Button>
          </Form.Item>
        </Form>
      )}
      <div>{ipfsHashNFT}</div>
      <AddressInput
        ensProvider={props.ensProvider}
        placeholder="Recipient Address"
        value={mintTo}
        onChange={newValue => {
          setMintTo(newValue);
        }}
      />
      <Input
        value={ipfsHash}
        placeholder="IPFS Hash"
        onChange={e => {
          setIpfsHash(e.target.value);
        }}
      />
      {writeContracts?.YourCollectible?.address}
      <br />
      <Button
        style={{ margin: 8 }}
        loading={sendingMint}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
          setSending(true);
          console.log("sending");
          await writeContracts.YourCollectible.mintItem(mintTo, ipfsHash);
          setSending(false);
        }}
      >
        Mint
      </Button>
    </div>
  );
}
