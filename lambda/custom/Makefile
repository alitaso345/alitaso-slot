deploy:
	zip -r ./deploy-package.zip *
	aws lambda update-function-code --function-name alitaso-slot --zip-file fileb://./deploy-package.zip --publish