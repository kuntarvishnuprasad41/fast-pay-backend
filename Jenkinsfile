pipeline {
    agent any

   environment {
        NODEJS_HOME = "${tool 'nodejs'}"
        PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Cleaning') { 
            steps { 
                sh 'rm -rf .expo && rm -rf .git'
                sh 'sudo cp -r . ~/deployment/deep/fast-pay-backend/'

               
            }
        }
        
        stage('Install Packages') { 
            steps {
                sh '  npm install && npm install ~/deployment/deep/fast-pay-backend/' 
            }
        }
        
 

         stage('pm2 restartr all') { 
            steps {
                sh 'pm2 restart fast-pay-backend' 
            }
        }

    }
}