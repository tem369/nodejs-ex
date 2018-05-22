/**
 * Created by Jacky on 2016-04-07.
 */


angular.module('skiApp', ['ui.router'])

    .factory('dataService', dataService)
    .factory('productService', productService)
    .factory('compareProductsService', compareProductsService)
    .factory('cartService',cartService)
    .factory('loginService',loginService)

    .constant('shownProductNumInRow', 3)
    .constant('shownMaxProductRowNumInPage', 2)

    .controller('mainController', mainController)
    .controller('showProductsController', showProductsController)
    .controller('oneProductController',oneProductController)
    .controller('compareProductsController',compareProductsController)
    .controller('cartProcessController',cartProcessController)
    .controller('registerController',registerController)
    .controller('signinController',signinController)

    .config(config);



//config
function config($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'home.html'
        })
        .state('skiBoots', {
            url: "/skiBoots",
            templateUrl: "showProducts.html",
            controller: 'showProductsController'
        })
        .state('skiCloths', {
            url: "/skiCloths",
            templateUrl: "showProducts.html",
            controller: 'showProductsController'
        })
        .state('backToLast', {
            url: "/backToLast",
            templateUrl: "showProducts.html",
            controller: 'showProductsController'
        })
        .state('compareProducts', {
            url: "/compareProducts",
            templateUrl: "compareProducts.html",
            controller: "compareProductsController"
        })
        .state('cartProcess', {
            url: "/cartProcess",
            templateUrl: "cartProcess.html",
            controller: "cartProcessController"
        })
        .state('signin', {
            url: "/signin",
            templateUrl: "signin.html",
            controller: "signinController"
        })
        .state('register', {
            url: "/register",
            templateUrl: "register.html",
            controller: "registerController"
        })
        .state('oneProduct', {
            url: "/oneProduct/:id",
            templateUrl: "oneProductShown.html",
            controller: "oneProductController"
        });
}



//controllers
mainController.$inject=['cartService','$scope','compareProductsService','productService','loginService'];
function mainController(cartService,$scope,compareProductsService,productService,loginService){
    var vm=this;
    //vm.shownComparedProducts=[];//array of products being hanging compared products
    vm.runActivate={};//vm.runActivate.run=showProductsController.Activate
    vm.runRemoveOneComparedPRoduct={};//mC.runRemoveOneComparedPRoduct.run=compareProductsController.removeOneComparedProduct
    vm.clearCompare=clearCompare;
    vm.removeOneComparedProduct=removeOneComparedProduct;
    vm.mixRemoveOneComparedProduct=mixRemoveOneComparedProduct;
    vm.currenyCartProductNum=0;
    vm.getCurrentCartProductNum=getCurrentCartProductNum;
    vm.getShownComparedProductsLength=getShownComparedProductsLength;
    vm.getCurrentComparedProducts=getCurrentComparedProducts;
    vm.getPersonInfoName=getPersonInfoName;


    updateShownByCurrentComparedProducts();

function getPersonInfoName(){
    return loginService.getName();
}
    function getCurrentComparedProducts(){
        return compareProductsService.getCurrentComparedProducts();
    }

function getShownComparedProductsLength(){
    var currentCompareProducts=compareProductsService.getCurrentComparedProducts();
    return currentCompareProducts.length;
}

    function getCurrentCartProductNum(){
        vm.currenyCartProductNum=cartService.getCurrentCartProductNum();
    }

    /**
     *  check vm.runRemoveOneComparedPRoduct.run==undefined, true--compareProductsController is not runing
     *       true---remove compares products in compareProductsService, update compare part in indexhtml and update showncompare in skiBoots
     * @param index
     */
    function mixRemoveOneComparedProduct(index) {
        //console.log(vm.runRemoveOneComparedPRoduct.run);
        //console.log(vm.runActivate.run);
        if (vm.runRemoveOneComparedPRoduct.run == undefined) {
            vm.removeOneComparedProduct(index);
            vm.runActivate.run();
        } else {
            vm.runRemoveOneComparedPRoduct.run(index);
        }
    }

    /**
     * step1:remove corresponding value to input index in the array--currentComparedProducts in compareProductsService
     * step2:update the array of products being hanging compared products from comparePRoductsService
     * @param index
     */
    function removeOneComparedProduct(index){
        //step1:remove corresponding value to input index in the array--currentComparedProducts of compareProductsService
        compareProductsService.removeOneComparedProduct(index);
        //step2:update the array of products being hanging compared products from comparePRoductsService
        updateShownByCurrentComparedProducts();
    }

    /**
     * function:
     * step1:  set currentComparedProducts=[] in compareProductsService
     * step2:update the array of products being hanging compared products from comparePRoductsService
     */
    function clearCompare(){
        compareProductsService.clearComparedProducts();//set currentComparedProducts=[];
        updateShownByCurrentComparedProducts();
    }

    /**
     * update the array of products being hanging compared products from comparePRoductsService
     */
    function updateShownByCurrentComparedProducts() {
        vm.shownComparedProducts = compareProductsService.getCurrentComparedProducts();
        //console.log(vm.comparedProducts);
    }

}


showProductsController.$inject=['$scope','$http','productService','compareProductsService','shownProductNumInRow','shownMaxProductRowNumInPage','$state'];
function showProductsController($scope,$http,productService,compareProductsService,shownProductNumInRow,shownMaxProductRowNumInPage,$state){
    var vm=this;

    var shownProducts=[];
    vm.width=100/shownProductNumInRow+"%";//the width of every product in one row
    vm.shownProductPages=[];//

    vm.pageSize=shownMaxProductRowNumInPage;
    vm.rowSize=shownProductNumInRow;
    vm.shownProductsCompare=[];//checkBox ng-model variable corresponding to current products being shown//true or false
    vm.updateCompare=updateCompare;
    vm.currentFilterCtrl = {};//object ---filter



    //console.log($state.current.name);
    if($state.current.name!="backToLast") {

        init();
    }

    vm.activate=activate;
    $scope.mC.runActivate.run=activate;

    activate();

    /**
     *  According to changes of shown checkbox compared status
     *  update array of current compared products in compareProductService
     * @param shownCompareIndex---index of current products
     * @param compare---compare status being changed
     */
    function updateCompare(shownCompareIndex, compare) {
        compareProductsService.updateComparedProductsByShownCompare(shownCompareIndex, compare);
        //console.log(compareProductsService.getCurrentComparedProducts());
    }

    /**
     * step1: get the value of currentPage in productService
     * step2: get the value of currentFilterCtrl in productService
     * step3: get current used table of database in productService
     * step4: get current products, set these values in productService
     *       and  set corresponding value to true in vm.shownProductsCompare if this product lies in current compared products
     * @returns {*}
     */
    function activate() {
        //console.log(vm.currentFilterCtrl);
        //step1
        vm.currentPage = productService.getCurrentPage();
        //step2:
        vm.currentFilterCtrl = productService.getCurrentFilterCtrl();
        //step3
        var currentTable=productService.getCurrentTable();//current table
        //step4
        return productService.getBySQL("select * from "+ currentTable +" "+ filterSelect())
            .then(getData);
    }

    /**
     * step1: change one dimension--data to two dimension --vm.twoDim
     * step2: calculate the page index to be put in  array--vm.shownProductPages
     * step3: set currentProducts in productService
     * step4: set currentPage in productService
     * step5: set currentFilterCtrl in productService
     * step6: set corresponding value to true in vm.shownProductsCompare if this product lies in current compared products
     * @param data
     */

    function getData(data) {

        //step1
        vm.twoDim = oneToTwoDim(data, shownProductNumInRow);
        //console.log(vm.twoDim);
        //step2
        calculateShownProductPages();
        //step3
        productService.setCurrentProducts(data);
        //step4
        productService.setCurrentPage(vm.currentPage);
        //step5
        productService.setCurrentFilterCtrl(vm.currentFilterCtrl);
        //step6
        vm.shownProductsCompare=compareProductsService.getShownCompareByComparedProducts();
        //console.log(vm.shownCompare);
    }

    /**
     * step1: set vm.currentPage=1
     * step2: which table use which initilize object-- vm.currentFilterCtrl
     *        set currentTable in skiBooterService
     * step3:  set currentFilterCtrl in skiBooterService
     *         set currentPage in skiBooterService
     *
     *
     */
    function init(){
        //step1
        vm.currentPage = 1;
        //step2
        switch ($state.current.name) {
            case 'skiBoots':
                filterCtrlInit_skiBoots();
                productService.setCurrentTable("ski.skiBoots");
                break;
            case 'skiCloths':
                filterCtrlInit_skiCloths();
                productService.setCurrentTable("ski.skiCloths");
                break;
            default:
                filterCtrlInit_skiBoots();
                productService.setCurrentTable("ski.skiBoots");
                break;
        }
        //step3
        productService.setCurrentFilterCtrl(vm.currentFilterCtrl);
        productService.setCurrentPage(vm.currentPage);
        //////step4
        console.log("one");
        //console.log(compareProductsService);
        if(compareProductsService!=undefined)
        compareProductsService.clearComparedProducts();
    }

    function filterCtrlInit_skiBoots() {

        vm.currentFilterCtrl = {};//object with three levels
        vm.currentFilterCtrl.color = {};//first level and it will be shown in left part
        vm.currentFilterCtrl.price = {};

        //color
        vm.currentFilterCtrl.color.red={};//second level
        vm.currentFilterCtrl.color.red.value = false;//third level, the value corresponding to checked or not of checkbox
        vm.currentFilterCtrl.color.red.show = "red";//the value being shown in left part
        vm.currentFilterCtrl.color.red.sql = "color='red'";//the value being used for sql select

        vm.currentFilterCtrl.color.white={};
        vm.currentFilterCtrl.color.white.value = false;
        vm.currentFilterCtrl.color.white.show = "white";
        vm.currentFilterCtrl.color.white.sql = "color='white'";

        vm.currentFilterCtrl.color.blue={};
        vm.currentFilterCtrl.color.blue.value = false;
        vm.currentFilterCtrl.color.blue.show = "blue";
        vm.currentFilterCtrl.color.blue.sql = "color='blue'";

        //price
        vm.currentFilterCtrl.price.price0_100 = {};
        vm.currentFilterCtrl.price.price0_100.value = false;
        vm.currentFilterCtrl.price.price0_100.show = "$0--100";
        vm.currentFilterCtrl.price.price0_100.sql = "(price>0 and price <=100)";

        vm.currentFilterCtrl.price.price100_200 = {};
        vm.currentFilterCtrl.price.price100_200.value = false;
        vm.currentFilterCtrl.price.price100_200.show = "$100--200";
        vm.currentFilterCtrl.price.price100_200.sql = "(price>100 and price<=200)";

        vm.currentFilterCtrl.price.price200_2000 = {};
        vm.currentFilterCtrl.price.price200_2000.value = false;
        vm.currentFilterCtrl.price.price200_2000.show = "$200--2000";
        vm.currentFilterCtrl.price.price200_2000.sql = "(price>200 and price<=2000)";

        vm.currentFilterCtrl.price.price2000_up = {};
        vm.currentFilterCtrl.price.price2000_up.value = false;
        vm.currentFilterCtrl.price.price2000_up.show = "$2000--up";
        vm.currentFilterCtrl.price.price2000_up.sql = "(price>2000)";

    }
    function filterCtrlInit_skiCloths() {
        vm.currentFilterCtrl = {};
        vm.currentFilterCtrl.color = {};
        vm.currentFilterCtrl.price = {};

        //color
        vm.currentFilterCtrl.color.red={};
        vm.currentFilterCtrl.color.red.value = false;
        vm.currentFilterCtrl.color.red.show = "red";
        vm.currentFilterCtrl.color.red.sql = "color='red'";
        vm.currentFilterCtrl.color.white={};
        vm.currentFilterCtrl.color.white.value = false;
        vm.currentFilterCtrl.color.white.show = "white";
        vm.currentFilterCtrl.color.white.sql = "color='white'";
        vm.currentFilterCtrl.color.blue={};
        vm.currentFilterCtrl.color.blue.value = false;
        vm.currentFilterCtrl.color.blue.show = "blue";
        vm.currentFilterCtrl.color.blue.sql = "color='blue'";

        //price
        vm.currentFilterCtrl.price.price0_100 = {};
        vm.currentFilterCtrl.price.price0_100.value = false;
        vm.currentFilterCtrl.price.price0_100.show = "$0--100";
        vm.currentFilterCtrl.price.price0_100.sql = "(price>0 and price <=100)";

        vm.currentFilterCtrl.price.price100_200 = {};
        vm.currentFilterCtrl.price.price100_200.value = false;
        vm.currentFilterCtrl.price.price100_200.show = "$100--200";
        vm.currentFilterCtrl.price.price100_200.sql = "(price>100 and price<=200)";

        vm.currentFilterCtrl.price.price200_2000 = {};
        vm.currentFilterCtrl.price.price200_2000.value = false;
        vm.currentFilterCtrl.price.price200_2000.show = "$200--2000";
        vm.currentFilterCtrl.price.price200_2000.sql = "(price>200 and price<=2000)";

        vm.currentFilterCtrl.price.price2000_up = {};
        vm.currentFilterCtrl.price.price2000_up.value = false;
        vm.currentFilterCtrl.price.price2000_up.show = "$2000--up";
        vm.currentFilterCtrl.price.price2000_up.sql = "(price>2000)";

    }

    /**
     * get corresponding sql where condition
     * @returns {string}
     */
    function filterSelect() {
        var wherecondition = "";
        var firstSign = true;
        var wherecondition1;
        var firstSign1;

        for (key in vm.currentFilterCtrl) {//loop first level--color, price etc
            wherecondition1 = "";//the condition corresponding to one first level such as color
            firstSign1 = true; //mean firstly have the condition

            for (subKey in vm.currentFilterCtrl[key]) {//loop second level--- such as red, white etc
                if (vm.currentFilterCtrl[key][subKey].value) {// the chechBox is checked
                    if (firstSign1) {
                        wherecondition1 = wherecondition1 + " " + vm.currentFilterCtrl[key][subKey].sql;//add corresponding sql
                        firstSign1 = !firstSign1;
                    }
                    else
                        wherecondition1 = wherecondition1 + " or " + vm.currentFilterCtrl[key][subKey].sql;//add " or " and corresponding sql
                }
            }
            if (wherecondition1) {//wherecontion1 have condition
                if (firstSign) {
                    wherecondition = "(" + wherecondition1 + ")";//add "()"
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " and (" + wherecondition1 + ")";//add "and ()"

            }
        }

        //console.log(wherecondition);
        if (wherecondition) wherecondition = "where " + wherecondition;//add "where"

        return wherecondition;

    }

    /**
     * calculate total pages and put the page index in array--vm.shownProductPages
     * according to the value--shownMaxProductRowNumInPage
     */
    function calculateShownProductPages(){
        vm.shownProductPages=[];
        var totalRow=Math.ceil(vm.twoDim.length/shownMaxProductRowNumInPage);
        for(var i=0;i<totalRow;i++)
            vm.shownProductPages[i]=i+1;
    }

    /**
     *to show one dimension arrary, transfer one dimension data into two dimension using rowSize
     * @param oneDim---input arrary
     * @param rowSize---row size
     * @returns {Array}---two dimension array
     */
    function oneToTwoDim(oneDim,rowSize){
        var newArr = [];
        for (var i=0; i<oneDim.length; i+=rowSize) {
            newArr.push(oneDim.slice(i, i+rowSize));
        }
        return newArr;
    }
}

oneProductController.$inject=['$scope','cartService','productService','$state','$stateParams'];
function oneProductController($scope, cartService,productService,$state,$stateParams){
    var vm=this;

    vm.params=$stateParams.id;
    vm.state=$state.current;
    vm.currentProducts=productService.getCurrentProducts();

    vm.addOneToCart=addOneToCart;
    vm.quantity=1;


    function addOneToCart(product,quantity){
        cartService.addProducts(product,quantity);
        $scope.mC.getCurrentCartProductNum();
    }
}

compareProductsController.$inject=['$scope','compareProductsService'];
function compareProductsController($scope,compareProductsService) {
    var vm = this;
    var currentComparedProducts;//array of current compared products
    vm.compareProductsDetails = {};//an object which every properity with an array containing the corresponding value of every compared product
    vm.removeOneComparedProduct = removeOneComparedProduct;
    $scope.mC.runRemoveOneComparedPRoduct.run = removeOneComparedProduct;

    getCompareDetailsByCurrentComparedProducts();


    /**step1: get current compared products
     * step2: transfer the array--currentComparedProducts
     *        to the object with every properity containing an array
     */
    function getCompareDetailsByCurrentComparedProducts() {
        //step1: get current compared products
        currentComparedProducts = compareProductsService.getCurrentComparedProducts();
        //step2: transfer the array--currentComparedProducts
        //         to the object with every properity containing an array
        if(currentComparedProducts.length==0)
            vm.compareProductsDetails={};
        for (var i = 0; i < currentComparedProducts.length; i++) {
            if (i == 0) {
                for (key in currentComparedProducts[i]) {
                    vm.compareProductsDetails[key] = [];
                }
            }
            for (key in currentComparedProducts[i]) {
                vm.compareProductsDetails[key].push(currentComparedProducts[i][key]);
            }
        }
    }

    /**
     * step1: call removeOneComparedProduct function of mainController
     *             to remove corresponding value to input index in the array--currentComparedProducts of compareProductsService
     *             and to update the array of products being hanging compared products from comparePRoductsService
     * step2:
     * @param index
     */
    function removeOneComparedProduct(index){
        //step1
        $scope.mC.removeOneComparedProduct(index);
        //step2
        $scope.mC.runActivate.run();
        console.log(vm.compareProductsDetails);
        if(Object.keys(vm.compareProductsDetails).length !=0)
        getCompareDetailsByCurrentComparedProducts();

    }

}

cartProcessController.$inject=['cartService'];
function cartProcessController(cartService){
    var vm=this;

    vm.currentCart=getCurrentCart();
    vm.removeOneProduct=removeOneProduct;
    vm.getTotalPrice=getTotalPrice;




    function getTotalPrice(){
        var totalPrice=0;
      for(var i=0;i<vm.currentCart.products.length;i++){
          totalPrice += vm.currentCart.products[i].price*vm.currentCart.quantity[i];
      }
        return totalPrice;
    }

    function removeOneProduct(index) {
        vm.currentCart.products.splice(index, 1);
        vm.currentCart.quantity.splice(index, 1);
    }
    function getCurrentCart(){
        return cartService.getCurrentCart();
    }


}

signinController.$inject=['loginService','$state','dataService'];
function signinController(loginService,$state,dataService){
    var vm=this;
   vm.submit=submit;
    vm.forgetPassword=false;
    vm.accountNotExist=false;

    vm.email = "e@c.c";
    vm.password = "wangbo";


    function submit() {
        //step1: load information from database
        var sql="SELECT * FROM ski.users where (email='" + vm.email + "') and (password='"+vm.password+"')";

        console.log(sql);
        dataService.getBySQL(sql).then(verifyReturn);
        function verifyReturn(data) {
            console.log(data);
            if(data.length==0){

                var sql="SELECT * FROM ski.users where (email='" + vm.email + "')";
                dataService.getBySQL(sql).then(function(data1){
                    console.log(data1);
                    if(data1.length==1) vm.forgetPassword=true;
                        else vm.accountNotExist=true;
                });
            } else{
                loginService.setCurrentUser(data[0]);
                var t=loginService.getCurrentUser();
                console.log(loginService.getName());
                $state.go('home');
            };


            //for (key in data) {
            //    for (key1 in data[key]) {
            //        console.log(data[key][key1]);
            //
            //        if (data[key][key1] == '0') return true;
            //        else return false;
            //    }
            //}
        }
    }


    //step2: check email do ot exist
    //   or password not correct


}

registerController.$inject=['loginService','$state','dataService'];
function registerController(loginService,$state,dataService) {
    var vm = this;

    vm.submit = submit;

    //init
    vm.name = "";
    vm.email = "";
    vm.password = "";
    vm.password1 = "";

    ///test
    vm.name = "Jacky";
    vm.email = "e@c.c";
    vm.password = "wangbo";
    vm.password1 = "wangbo";

    vm.accountExistStatus = false;


    function submit() {



        verifyNewAccout().then(process);

        function process(res) {

            if (res) {// new account

                var sql = "insert into ski.users (name,email,password) values ('" + vm.name + "','" + vm.email + "','" + vm.password + "')";

                dataService.getBySQL(sql).then(function (data) {
                    console.log(data);
                });

                loginService.setPersonInfo(vm.name, vm.email, vm.password);

                $state.go("home");
            }
            else
                vm.accountExistStatus = true;//already exist

        }

        /**
         *   verify this email already exist in database (false)or not(true)
         * @returns {*}
         */
        function verifyNewAccout() {
            var sql = "SELECT EXISTS (SELECT 1 FROM ski.users where email=" + "'" + vm.email + "')";
            console.log(sql);
            return dataService.getBySQL(sql).then(verifyReturn);

            function verifyReturn(data) {
                console.log(data);
                for (key in data) {
                    for (key1 in data[key]) {
                        console.log(data[key][key1]);

                        if (data[key][key1] == '0') return true;
                        else return false;
                    }
                }
            }

        }
    }

}

//Services



loginService.$inject=[];
function loginService(){
    var currentUser={};


       //user.personInfo={};//name,email,password
       //user.shippingAddress={};//mailName,address line1 line2,city,province,zip,country, phone
       //user.payment={};//credit information --- creditName , cardNumber,expireDate(month/year)

    return{
        setPersonInfo:setPersonInfo,
        getName:getName,
        setCurrentUser:setCurrentUser,
        getCurrentUser:getCurrentUser

    }
    function getCurrentUser(){
        return (this.currentUser);
    }

    function setCurrentUser(currentUser1){
        currentUser=currentUser1;
    }
    function getName(){
        return currentUser.name;
    }

    function setPersonInfo(name,email,password){//null
        if(name !="")
        currentUser.name=name;
        if(email !="")
            currentUser.email=email;
        if(password !="")
            currentUser.password=password;
    }

}

//cartService.$inject=[];
function cartService(){
    var currentCart={};
    currentCart.products=[];
    currentCart.quantity=[];

    return{
        getCurrentCart:getCurrentCart,
        addProducts:addProducts,
        removeProduct:removeProduct,
        getCurrentCartProductNum:getCurrentCartProductNum
    }

    function getCurrentCart(){
        return(currentCart);
    }
    function getCurrentCartProductNum(){
        return(currentCart.products.length);
    }

    function removeProduct(product){
        for(var i=0;i<currentCart.length;i++){
            if(currentCart[i].products.id==product.id)
            currentCart.splice(i,1);
        }
    }

    function addProducts(product,quantity){
        //console.log(product);

        var sign=true;

        for(var i=0;i<currentCart.products.length;i++ ) {
            if (currentCart.products[i].id == product.id) {
                currentCart.products[i].quantity = currentCart.products[i].quantity + quantity;
                sign = false;
                break;
            }
        }

        if(sign){
              currentCart.products.push(product);
             currentCart.quantity.push(quantity);
        }
    }
}

compareProductsService.$inject=['productService'];
function compareProductsService(productService){
    var currentComparedProducts=[];//the products being compared currently
    var shownComparedProducts={};

    return {
        getCurrentComparedProducts:getCurrentComparedProducts,
        setCurrentComparedProducts:setCurrentComparedProducts,
        updateComparedProductsByShownCompare:updateComparedProductsByShownCompare,
        getShownCompareByComparedProducts:getShownCompareByComparedProducts,
        clearComparedProducts: clearComparedProducts,
        getShownComparedProducts:getShownComparedProducts,
        setShownComparedProducts:setShownComparedProducts,
        currentComparedProductsToshown:currentComparedProductsToshown,
        removeOneComparedProduct:removeOneComparedProduct
    }

    function removeOneComparedProduct(index){
        currentComparedProducts.splice(index,1);
    }


    /**
     * transfer currentComparedProducts to shownComparedProducts for being shown in compareProduct.html
     */
    function currentComparedProductsToshown(){
        shownComparedProducts = {};
        for (var i = 0; i < currentComparedProducts.length; i++) {
            for (proKey in currentComparedProducts[i])
                shownComparedProducts[prokey] = [];
            for (proKey in currentComparedProducts[i])
                shownComparedProducts[prokey][i] = currentComparedProducts[i][prokey];
        }
        //console.log(shownComparedProducts);
    }

    function getShownComparedProducts() {
        return (this.shownComparedProducts);
    }

    function setShownComparedProducts(shownComparedProducts) {
        this.shownComparedProducts = shownComparedProducts;
    }

    function clearComparedProducts() {
        currentComparedProducts = [];
    }

    /**
     * mark true in shownCompare which being compared
     * step1:get current products from productService
     * step2: let corresponding value = true in array --shownCompare if this product lies in current compared products
     * @returns {Array}
     */
    function getShownCompareByComparedProducts() {
        var currentProducts = productService.getCurrentProducts();
        var shownCompare = [];

        for (var i = 0; i < currentProducts.length; i++)
            shownCompare.push(false);

        for (var i = 0; i < currentComparedProducts.length; i++) {
            for (var j = 0; j < currentProducts.length; j++) {
                if (currentComparedProducts[i].id === currentProducts[j].id) {
                    shownCompare[j] = true;
                    break;
                }
            }
        }
        return shownCompare;
    }

    /**
     *  According to changes of shown checkbox compared status
     *  update array of current compared products
     * @param shownCompareIndex---index of current products
     * @param compare---compare status being changed
     */
    function updateComparedProductsByShownCompare(shownCompareIndex, compare) {
        var product = (productService.getCurrentProducts())[shownCompareIndex];

        if (compare)//being marked as being compared
            currentComparedProducts.push(product);
        else {

            for (var i = 0; i < currentComparedProducts.length; i++) {
                if (currentComparedProducts[i].id === product.id) {
                    currentComparedProducts.splice(i, 1);//remove this compared product
                    break;
                }
            }
        }
        //console.log(currentComparedProducts);
    }

    function getCurrentComparedProducts() {
        return currentComparedProducts;
    }

    function setCurrentComparedProducts(currentComparedProducts) {
        this.currentComparedProducts=currentComparedProducts;
    }
}

productService.$inject=['dataService'];
function productService(dataService) {
        var currentProducts=[];
        var currentPage;
        var currentFilterCtrl={};
        var currentTable;

        return {
            getBySQL: getBySQL,
            setCurrentProducts:setCurrentProducts,
            getCurrentProducts:getCurrentProducts,
            setCurrentPage:setCurrentPage,
            getCurrentPage:getCurrentPage,
            setCurrentFilterCtrl:setCurrentFilterCtrl,
            getCurrentFilterCtrl:getCurrentFilterCtrl,
            setCurrentTable:setCurrentTable,
            getCurrentTable:getCurrentTable
        };
        function setCurrentTable(currentTable) {
            this.currentTable = currentTable;
        }

        function getCurrentTable() {
            return (this.currentTable);
        }
        function setCurrentFilterCtrl(currentFilterCtrl){
            this.currentFilterCtrl=currentFilterCtrl;
        }

        function getCurrentFilterCtrl(){
            return(this.currentFilterCtrl);
        }

        function setCurrentPage(currentPage){
            this.currentPage=currentPage;
        }

        function getCurrentPage(){
            return(this.currentPage);
        }

        function setCurrentProducts(currentProducts){
            this.currentProducts=currentProducts;
        }

        function getCurrentProducts(){
            return(this.currentProducts);
        }

        function getBySQL(SQLStatement) {
            return dataService.getBySQL(SQLStatement);
        }
}

dataService.$inject=['$http'];
function dataService($http){

    return {
        getBySQL: getBySQL,
    };

    function getBySQL(SQLStatement) {
//        $http.get("http://localhost:8080/dbInit");
        return $http.get("/data",
            {
                params:{SQL: SQLStatement}
            })
            .then(getBySQLComplete)
            .catch(getBySQLFailed);

        function getBySQLComplete(response) {
            return response.data;
        };

        function getBySQLFailed(error) {
            console.log(error);
        };

    }
}

