import boto3
import logging
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client('s3', region_name=settings.AWS_REGION)
        self.bucket_name = settings.AWS_S3_BUCKET

    def upload_file(self, file_content, object_name):
        """Dosyayı S3'e yükler."""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_name,
                Body=file_content
            )
            logger.info(f"Dosya S3'e yüklendi: {object_name}")
            return True
        except ClientError as e:
            logger.error(f"S3 Yükleme Hatası: {e}")
            return False

    def download_file(self, object_name):
        """Dosyayı S3'ten indirir ve byte olarak döner."""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return response['Body'].read()
        except ClientError as e:
            logger.error(f"S3 İndirme Hatası: {e}")
            return None

s3_service = S3Service()
