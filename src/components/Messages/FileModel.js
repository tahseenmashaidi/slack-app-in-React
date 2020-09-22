import React, {Component} from 'react';
import {Button, Icon, Input, Modal} from "semantic-ui-react";
import mime from 'mime-types';


class FileModel extends Component {
    state={
        file:null,
        authorized:['image/jpeg','image/png']
    }
    addFile=event=>{
        const file=event.target.files[0];
        if (file){
            this.setState({file:file});
        }
    };
    sendFile=()=>{
        const {file}=this.state;
        const {uploadFile,closeModel}=this.props;
        if (file!==null){
            if (this.isAuthorized(file.name)){
                const metadata={contentType:mime.lookup(file.name)};
                uploadFile(file,metadata);
                closeModel();
                this.clearFile();
            }
        }
    };

    isAuthorized=filename=>this.state.authorized.includes(mime.lookup(filename));
    clearFile=()=> this.setState({file:null});

    render() {
        const {model,closeModel}=this.props
        return (
            <Modal basic open={model} onClose={closeModel}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input
                        fluid
                        onChange={this.addFile}
                        label={"File type:jpg,png"}
                        name={"file"}
                        type={"file"}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={this.sendFile}
                        color={"green"}
                        inverted
                    >
                        <Icon name={"checkmark"}/>Send
                    </Button>
                    <Button
                        color={"red"}
                        inverted
                        onClick={closeModel}
                    >
                        <Icon name={"remove"}/>Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModel;