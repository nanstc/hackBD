
app.controller('MainController', function ($scope, productService, ngDialog) {
    $scope.sortKey = "";
    $scope.sortAttr = "";
	$scope.maxComparables = 4;
	$scope.CountryByCode = {"9" : "Canada", "225" : "USA"};
	$scope.ProductsByCategory = [];
	$scope.searchQuery = "";
	$scope.ProductsToCompare = [];
    $scope.ProductCategories= [];
    $scope.ProductAttributesToCompare = [
        ["brand", "Brand"],
        ["category", "Category"],
        ["price", "Price"], 
        ["overallRating", "Overall Rating"], 
        ["reviewCount", "Review Count"], 
        ["deals", "Deals"]
    ];
    $scope.City = "";
    $scope.Country = "";
    
    $scope.show = false;
    $scope.slide = false;
    
    $scope.SelectedProduct = {};

    $scope.graph = {};
	$scope.graph.labels = [];
    $scope.graph.series = [];
    $scope.graph.data = [];
    $scope.graph.countryWise = {};

    $scope.Filter = {};
    $scope.Filter.Budget = 5000;
    $scope.Filter.Brand = "";
    $scope.Filter.Category = "";
    $scope.Filter.Rating = 0.0;

    $scope.WishList = [];

    //GetLocation();

    FetchProducts();

	function FetchProducts()
	{
        if ( $scope.searchQuery.length > 0 )
        {
            productService.getProducts($scope.searchQuery).then(function(data)
            {
                $scope.ProductsByCategory = data;
            });
        }
	}

	function GetLocation()
	{
		productService.getLocation().then(function(data) {
			$scope.City = data.City;
			$scope.Country = data.Country;
		});
	}

	$scope.Search = function()
	{
		console.log("Test");
		FetchProducts();
	}

	$scope.AddToCompare = function(product)
	{
        if ( $scope.ProductsToCompare.length < $scope.maxComparables && $scope.ProductsToCompare.indexOf(product) === -1)
        {
            $scope.show = true;
            $scope.ProductsToCompare.push(product);
        }
        else
        {
        	$scope.ProductsToCompare.splice($scope.ProductsToCompare.indexOf(product), 1);
        	if ($scope.ProductsToCompare.length < 1)
        		$scope.show = false;
        	
        }
	}

	$scope.CheckInCompareList = function(product) {
		return !($scope.ProductsToCompare.indexOf(product) === -1);
	}

	$scope.GetProductAnalytics = function(skuNumber)
	{
		productService.getProductRatings(skuNumber).then(function(data) {
			
		});
	}

	$scope.RemoveFromCompare = function(productIndex)
	{
		$scope.ProductsToCompare.splice(productIndex, 1);
	}
    
    $scope.hideOrShowCompare = function() {
        return $scope.CollapseCompare;
    }

	$scope.CompareNow = function()
	{
        if ( $scope.ProductsToCompare.length > 1 )
        {
            ngDialog.open({
                template: './app/partials/productComparison.html',
                width: '80%',
                height: '630px',
                scope: $scope
		  });
        }
	}

	$scope.AddRemoveToWishList = function(product)
	{
		if ( $scope.WishList.indexOf(product) === -1)
        {
            $scope.WishList.push(product);
        }
        else
        {
			$scope.WishList.splice($scope.WishList.indexOf(product), 1);
        }
	}

	$scope.CheckInWishList = function(product) {
		return !($scope.WishList.indexOf(product) === -1);
	}

	$scope.ShowWishList = function()
	{
		ngDialog.open({
                template: './app/partials/productWishList.html',
                width: '60%',
                scope: $scope
		  });		
	}

    $scope.ShowProductDetails = function(product)
    {
    	$scope.SelectedProduct = product;

    	ngDialog.open({
                template: './app/partials/productDetails.html',
                width: '80%',
                scope: $scope
		  });
    }
    
	$scope.ShowAnalytics = function(product)
	{
		productService.getProductRatings(product.skuNumber).then(function(data) {
			var ratingAll = data.RatingAll;

			$scope.graph.data = [];
			$scope.graph.labels = [];
			var ratingByMonths = []; var ratingByYear = [];	var nameYear = []; var nameMonth = []; var prevMonth = 0;
			var prevYear = 0; var sumYear = 0; var sumMonth = 0; var countYear = 0;	var countMonth = 0;

			$scope.graph.countryWise = data.RatingByCountry;

			for (var i=0; i<ratingAll.length; i++)
			{
				var reviewDate = new Date(ratingAll[i].ReviewDate);

				if (reviewDate.getFullYear() != prevYear )
				{					
					if (prevYear != 0)
					{
						ratingByYear.push(sumYear/countYear);
						nameYear.push(prevYear);
						sumYear = 0;
						countYear = 0;
					}

					prevYear = reviewDate.getFullYear();
				}

				if (reviewDate.getMonth() != prevMonth )
				{					
					if (prevMonth != 0)
					{
						ratingByMonths.push(sumMonth/countMonth);
						nameMonth.push(prevMonth + "-" + prevYear);
						sumMonth = 0;
						countMonth = 0;
					}

					prevMonth = reviewDate.getMonth();
				}

				sumYear += ratingAll[i].rating;
				countYear++;

				sumMonth += ratingAll[i].rating;
				countMonth++;

			}

			ratingByYear.push(sumYear/countYear);
			ratingByMonths.push(sumMonth/countMonth);

			if (ratingByYear.length >= 3)
			{
				$scope.graph.data = ratingByYear;
				$scope.graph.labels = nameYear;
			}
			else
			{
				$scope.graph.data = ratingByMonths;
				$scope.graph.labels = nameMonth;
			}


		});

		ngDialog.open({
		    template: './app/partials/productAnalytics.html',
		    width: '50%',
            scope: $scope,
		});
	}
    
	$scope.UpdateTable = function(orderAttr)
	{
        if ( orderAttr == "overallRating")
        {
            if ( $scope.sortAttr == "overallRating" && $scope.sortKey.charAt( 0 ) == '-' )
            {
                $scope.sortKey = "overallRating";
            }
            else
            {
                $scope.sortKey = "-overallRating";
            }
        }
        else if ( orderAttr == "reviewCount")
        {
            if ( $scope.sortAttr == "reviewCount" && $scope.sortKey.charAt( 0 ) == '-' )
            {
                $scope.sortKey = "reviewCount";
            }
            else
            {
                $scope.sortKey = "-reviewCount";
            }
        }
        else if ( orderAttr == "brand")
        {
            if ( $scope.sortAttr == "brand" && $scope.sortKey.charAt( 0 ) == '-' )
            {
                $scope.sortKey = "brand.name";
            }
            else
            {
                $scope.sortKey = "-brand.name";
            }
        }
        else if ( orderAttr == "category")
        {
            if ( $scope.sortAttr == "category" && $scope.sortKey.charAt( 0 ) == '-' )
            {
                $scope.sortKey = "category.categoryName";
            }
            else
            {
                $scope.sortKey = "-category.categoryName";
            }
        }
        else
        {
            if ( $scope.sortKey.charAt( 0 ) == '-' )
            {
                $scope.sortKey = orderAttr;
            }
            else
            {
                $scope.sortKey = "-" + orderAttr;
            }
        }
        $scope.sortAttr = orderAttr;
    }
});