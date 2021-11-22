import React from "react";
import { Button, Input, Tooltip, Form, InputNumber, Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { AddressInput } from ".";


export default function Mint(props) {
  const [mintTo, setMintTo] = React.useState();
  const [ipfsHash, setIpfsHash] = React.useState();
  const [sending, setSending] = React.useState();
  const [web3, setWeb3] = React.useState();
  const [buffer, setBuffer] = React.useState();
  console.log({ writeContracts: props.writeContracts });
  const writeContracts = props.writeContracts;
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };
  const validateMessages = {
    required: '${label} se necesita Descripcion!!',
  };
  const onFinish = (values) => {
    console.log(values);
  }
  function captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result))
      console.log('buffer', buffer)
    }
  }
  const upload=()=> {
    const reader = new FileReader();
    reader.onloadend = function() {
      const ipfsAPI = require("ipfs-http-client");
      const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
      const buf = Buffer(reader.result) // Convert data into buffer
      ipfs.add(buf, (err, result) => { // Upload buffer to IPFS
        if(err) {
          console.error(err)
          return
        }
        let url = `https://ipfs.io/ipfs/${result[0].hash}`
        console.log(`Url --> ${url}`)
        document.getElementById("url").innerHTML= url
        document.getElementById("url").href= url
        document.getElementById("output").src = url
      })
    }
    const photo = document.getElementById("photo");
    reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
  }


  return (
    <div>
      <fieldset>
        <legend>Upload photo</legend>
        <input type="file" name="photo" id="photo"></input>
        <button type="button" onClick={upload}>Upload</button>
      </fieldset>
      <br />
      <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
        <Form.Item name={['user', 'descripcion']} label="Descripcion" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'nombre']} label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
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
