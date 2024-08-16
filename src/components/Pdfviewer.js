// components/PDFViewer.js

const PDFViewer = ({ fileID }) => {
    return (
        <>
            {fileID ? (<iframe className="h-full w-full" src={`https://drive.google.com/file/d/${fileID}/preview`} />) : (<h1>NO CONTENT</h1>)}
        </>
    );
};

export default PDFViewer;


