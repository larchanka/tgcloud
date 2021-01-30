const otlTemplate = (checksum, asset) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download ${asset.assetName}</title>
    <link rel="stylesheet" href="/css/styles.css" />
</head>
<body>
<div class="otl">
<a href="/otl/${checksum}/download" download="${asset.assetName}">Download ${asset.assetName}</a>
</div>
</body>
</html>
`;

module.exports = otlTemplate;
