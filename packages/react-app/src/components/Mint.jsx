import React from "react";
import { Button, Input, Tooltip, Form, InputNumber, Upload, message, Steps, Image } from "antd";
import { AddressInput } from ".";

export default function Mint(props) {

  const [mintTo, setMintTo] = React.useState();
  const [ipfsHashPic, setIpfsHashPic] = React.useState();
  const [ipfsHashNFT, setIpfsHashNFT] = React.useState();
  const [sending, setSending] = React.useState();
  const [sendingPic, setSendingPic] = React.useState();
  const [sendingMint, setSendingMint] = React.useState();
  const [disabled, setDisabled] = React.useState(true);
  const [image, setImage] = React.useState();
  const [buffer, setBuffer] = React.useState();
  const [current, setCurrent] = React.useState(0);

  const writeContracts = props.writeContracts;

  const { Step } = Steps;

  const steps = [
    {
      title: "Paso 1",
      description: "Seleccione su imagen",
    },
    {
      title: "Paso 2",
      description: "Cargue un archivo",
    },
    {
      title: "Paso 3",
      description: "Complete informacion del NFT",
    },
    {
      title: "Paso 4",
      description: "Agregar Dirección",
    },
    {
      title: "Paso 5",
      description: "Listo!",
    },
  ];

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
  const onFinish = async values => {
    const jsonNFT = {
      description: values.user["descripcion"],
      name: values.user["nombre"],
      image: ipfsHashPic,
    };
    console.log("UPLOADING...", jsonNFT.name);
    setSendingMint(true);
    setIpfsHashNFT();
    const NFT_string = JSON.stringify(jsonNFT);
    const result = await ipfs.add(Buffer.from(NFT_string));
    if (result && result.path) {
      console.log(result.path);
    }
    setIpfsHashNFT(result[0].path);
    setSendingMint(false);
    console.log("RESULT:", result);
    setCurrent(3);
  };
  function captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    setImage(URL.createObjectURL(file));
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
      setDisabled(false);
      console.log("buffer", buffer);
    };
    setCurrent(1);
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
    setCurrent(2);
  };

  return (
    <div>
      <Steps current={current}>
        <Step title="Paso 1" description="Seleccione su imagen" />
        <Step title="Paso 2" description="Cargue la imagen" />
        <Step title="Paso 3" description="Complete y envie la informacion" />
        <Step title="Paso 4" description="Agregue la direccion del receptor" />
        <Step title="Paso 5" description="Listo!" />
      </Steps>
      <hr />
      <div>
        <legend>Subir su imagen</legend>
        <Image src={image} width={200} />
        <fieldset>
          <input type="file" name="photo" id="photo" color="blue" onChange={captureFile} />
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
        <br />
        {ipfsHashPic && (
          <Form
            {...layout}
            name="nest-messages"
            onFinish={onFinish}
            validateMessages={validateMessages}
            layout={"inline"}
            size={"large"}
          >
            <Form.Item name={["user", "nombre"]} label="Nombre" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name={["user", "descripcion"]} label="Descripcion" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit" sending={sending}>
                Subir a IPFS
              </Button>
            </Form.Item>
          </Form>
        )}
        <br />
        <AddressInput
          ensProvider={props.ensProvider}
          placeholder="Recipient Address"
          value={mintTo}
          onChange={newValue => {
            setMintTo(newValue);
          }}
        />
        <Input
          value={ipfsHashNFT}
          placeholder="IPFS Hash"
          onChange={newValue => {
            setIpfsHashNFT(newValue);
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
            await writeContracts.YourCollectible.mintItem(mintTo, ipfsHashNFT);
            setCurrent(4);
            setSending(false);
          }}
        >
          Mint
        </Button>
      </div>
    </div>
  );
}
