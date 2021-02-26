(function () {
  const product = JSON.parse(document.getElementById("ProductJson-product-template").textContent);
  document.getElementById("product-title").innerHTML = product.title;
  document.getElementById("product-description").innerHTML = product.description;
  document.getElementById("product-image").src = product.featured_image;
  document.getElementById("product-image").title = product.title;
  document.getElementById("product-price").innerHTML = `$${(product.price * 0.01).toFixed(2)}`;
  document.getElementById("product-overview").classList.remove("dn");
})();

