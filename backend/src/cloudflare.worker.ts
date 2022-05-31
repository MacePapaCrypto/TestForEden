addEventListener("fetch", event => {
  event.respondWith(handleRequest(event))
})

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(event) {
  // request
  const { request } = event;
  
  // Parse request URL to get access to query string
  let url = new URL(request.url);
  
  // check url
  if (!url.pathname.split('/').pop().includes('-')) {
    return new Response('Missing "image" value', {
      status : 400
    });
  }

  // split
  const [chain, contract, token] = url.pathname.split('/').pop().split('-');

  // check token
  if (!chain || !contract || !token) {
    return new Response('Missing "image" value', {
      status : 400,
    });
  }

  // width/height/fit/quality
  let width, height, fit, quality;

  // format
  const accept = request.headers.get('Accept')
  const format = (
    /image\/avif/.test(accept) ? 'avif' :
    /image\/webp/.test(accept) ? 'webp' :
    '0'
  );

  // Copy parameters from query string to request options.
  // You can implement various different parameters here.
  if (url.searchParams.has("f")) fit = url.searchParams.get("f");
  if (url.searchParams.has("w")) width = url.searchParams.get("w");
  if (url.searchParams.has("h")) height = url.searchParams.get("h");
  if (url.searchParams.has("q")) quality = url.searchParams.get("q");

  // find image key
  const imageKey = [chain, contract, token, '0', '0', '0', '0', '0'].join('-');
  const resizedImageKey = [chain, contract, token, width || '0', height || '0', fit || '0', quality || '0', format || '0'].join('-');

  // check fully resized already
  let resizedImage = await NFT_BUCKET.get(resizedImageKey);

  // check resized image exists
  if (resizedImage?.body) {
    // return response
    return new Response(resizedImage.body, {
      headers : resizedImage.headers,
    });
  }

  // check full image
  const fullImage = await NFT_BUCKET.get(imageKey);

  // if exists
  if (!fullImage?.body) {
    // image url
    const imageURL = `https://nft.edenup.com/nft-media/${chain}-${contract}-${token}`;

    // Build a request that passes through request headers
    const imageRequest = new Request(imageURL, {
      headers : request.headers,
    });

    // load response
    const newFullImage = await fetch(imageRequest);

    console.log('test', imageKey);

    // store in r2
    await NFT_BUCKET.put(imageKey, newFullImage.body, {
      httpMetadata : newFullImage.headers,
    });

    // check same
    if (imageKey === resizedImageKey) return newFullImage;
  }

  // check resized image exists
  if (imageKey === resizedImageKey && fullImage?.body) {
    // return response
    return new Response(fullImage.body, {
      headers : fullImage.headers,
    });
  }

  // resize full image
  const resizeRequest = new Request(`https://nft-media.moon.social/${chain}-${contract}-${token}`, {
    cf : {
      image : {
        fit,
        width,
        height,
        quality,

        // image format
        format : format === '0' ? undefined : format,
      }
    }
  });

  // Returning fetch() with resizing options will pass through response with the resized image.
  resizedImage = await fetch(resizeRequest, options);

  // store in r2
  await env.NFT_BUCKET.put(resizedImageKey, resizedImage.body, {
    httpMetadata : resizedImage.headers,
  });
  
  // return
  return resizedImage;
}