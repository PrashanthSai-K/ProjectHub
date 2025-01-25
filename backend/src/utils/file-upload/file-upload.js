const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir;
        if (req.params.id){
            uploadDir = path.join('uploads', req.params.id.toString()); // the  upload path is not needed from the query as it is always available while uploading files, if not then the project doesn't exists.
         } else{
            uploadDir = path.join('uploads', Date.now().toString()) // this is not needed, keeping this for safe side as multer requires a destination
        }
       cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
         cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });
module.exports = upload;