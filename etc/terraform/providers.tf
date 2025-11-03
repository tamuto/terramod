provider "aws" {
    region = "ap-northeast-1"
}

provider "google" {
    project = "your-gcp-project-id"
    region  = "asia-northeast1"
}

provider "azurerm" {
    features {}
}
