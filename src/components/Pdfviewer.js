// components/PDFViewer.js

const PDFViewer = ({ fileID }) => {
  return (
    <>
      {fileID ?
        (<iframe className="h-full w-full" src={`https://drive.google.com/file/d/${fileID}/preview`} />) :
        (<h1 className="h-full w-full flex items-center justify-center">
          NO CONTENT
        </h1>)
      }
    </>
  );
};

export default PDFViewer;


