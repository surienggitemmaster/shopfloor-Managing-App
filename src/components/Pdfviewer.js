// components/PDFViewer.js

const PDFViewer = ({ fileID }) => {
    console.log("This iidsd", fileID)
    return (
        <div style={{ height: '100%', width: '100%' }}>
            {fileID ? (<iframe src={`https://drive.google.com/file/d/${fileID}/preview`} width="100%" height="750px" />) : (<h1>NO CONTENT</h1>)}
        </div>
    );
};

export default PDFViewer;


