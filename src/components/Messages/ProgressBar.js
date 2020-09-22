import React from 'react';
import {Progress} from "semantic-ui-react";

const ProgressBar = ({percentUpload,uploadState}) => (
    uploadState &&(
        <Progress
            className={"progress_bar"}
            percent={percentUpload}
            progress
            indicating
            size={"medium"}
            inverted
        />
    )
);

export default ProgressBar;