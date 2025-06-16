const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Upload file to S3
const uploadToS3 = async (file) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `hostels/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image');
  }
};

// Delete file from S3
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split('/').slice(-2).join('/');
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3
};