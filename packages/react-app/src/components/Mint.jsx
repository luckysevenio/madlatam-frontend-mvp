import React from "react";
import { Button, Input, Tooltip, Form, InputNumber, Upload, message } from "antd";
import { AddressInput } from ".";
import { disable } from "debug";

export default function Mint(props) {
  const [mintTo, setMintTo] = React.useState();
  const [ipfsHash, setIpfsHash] = React.useState();
  const [sending, setSending] = React.useState();
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
    required: "${label} se necesita Descripcion!!",
  };
  const onFinish = values => {
    console.log(values);
  };
  function captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
      setDisabled(false)
      console.log("buffer", buffer);
      console.log(buffer);
    };
  }
  const saveImageOnIpfs = async () => {
    console.log("UPLOADING...", Buffer.from(buffer));
    setSending(true);
    setIpfsHash();
    const result = await ipfs.files.add(buffer);
    if (result && result.path) {
      console.log(ipfsHash);
    }
    setIpfsHash(result[0].path);
    setSending(false);
    console.log("RESULT:", result[0].path);
  };

  return (
    <div>
      <fieldset>
        <legend>Subir su imagen</legend>
        <input type="file" name="photo" id="photo" onChange={captureFile}></input>
        <Button
          style={{ margin: 8 }}
          loading={sending}
          size="large"
          shape="round"
          type="primary"
          onClick={saveImageOnIpfs}
          disabled={disabled}
        >
          Cargar
        </Button>
      </fieldset>
      <div>{ipfsHash}</div>
      <br />
      {ipfsHash && (
        <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
          <Form.Item name={["user", "descripcion"]} label="Descripcion" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["user", "nombre"]} label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}
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
        loading={sending}
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
