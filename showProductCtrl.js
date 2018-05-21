/**
 * Created by Jacky on 2016-04-07.
 */


angular.module('skiApp',[])
    .factory('skiBootService',skiBootService)
    .constant('shownProductNumInRow',3)
    .constant('shownMaxProductRowNumInPage',2)
    .controller('showProducts',showProducts);

showProducts.$inject=['$http','skiBootService','shownProductNumInRow','shownMaxProductRowNumInPage'];
function showProducts($http,skiBootService,shownProductNumInRow,shownMaxProductRowNumInPage){
    var vm=this;
    var shownProducts=[];
    vm.width=100/shownProductNumInRow+"%";
    vm.shownProductPages=[];

    vm.pageSize=shownMaxProductRowNumInPage;

    //color
    vm.red =false;
    vm.white=false;
    vm.blue=false;

    //price
    vm.price0_100=false;
    vm.price100_200=false;
    vm.price200_2000=false;
    vm.price2000_up=false;

    vm.activate=activate;
    activate();

    function activate(){
        vm.currentPage=1;
        return skiBootService.getBySQL("select * from ski.skiBoots " + filterSelect())
            .then(getData);
    }

    function getData(data){
        vm.twoDim=oneToTwoDim(data,shownProductNumInRow);
        calculateShownProductPages();
    }

    function filterSelect() {
        var wherecondition = "";

        wherecondition = filterByColor();

        var nextCondition = filterByPrice();
        if (wherecondition && nextCondition)
            wherecondition = wherecondition + " and " + nextCondition;
        else
            wherecondition = wherecondition + nextCondition;

        if (wherecondition) wherecondition = "where " + wherecondition;

        return wherecondition;

        function filterByColor() {
            var wherecondition = "";
            var firstSign = true

            if (vm.red) {
                if (firstSign) {
                    wherecondition = wherecondition + " color='red'";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or color='red'";
            }

            if (vm.white) {
                if (firstSign) {
                    wherecondition = wherecondition + " color='white'";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or color='white'";
            }

            if (vm.blue) {
                if (firstSign) {
                    wherecondition = wherecondition + " color='blue'";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or color='blue'";
            }
            if (wherecondition) wherecondition = "(" + wherecondition + ")";

            return wherecondition;
        }

        function filterByPrice() {
            var wherecondition = "";
            var firstSign = true

            if (vm.price0_100) {
                if (firstSign) {
                    wherecondition = wherecondition + " (price>0 and price <=100)";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or (price>0 and price <=100)";
            }

            if (vm.price100_200) {
                if (firstSign) {
                    wherecondition = wherecondition + " (price>100 and price <=200)";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or (price>100 and price <=200)";
            }
            if (vm.price200_2000) {
                if (firstSign) {
                    wherecondition = wherecondition + " (price>200 and price <=2000)";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or (price>200 and price <=2000)";
            }
            if (vm.price2000_up) {
                if (firstSign) {
                    wherecondition = wherecondition + " (price>2000)";
                    firstSign = !firstSign;
                }
                else
                    wherecondition = wherecondition + " or (price>2000)";
            }


            if (wherecondition) wherecondition = "(" + wherecondition + ")";

            return wherecondition;
        }
    }


    function calculateShownProductPages(){
        vm.shownProductPages=[];
        var totalRow=Math.ceil(vm.twoDim.length/shownMaxProductRowNumInPage);
        for(var i=0;i<totalRow;i++)
            vm.shownProductPages[i]=i+1;
    }

    /**
     *to show one dimesion arrary, transfer one dimension data into two dimension
     * @param oneDim---input arrary
     * @param rowSize---transfered row size
     * @returns {Array}---two dimension array
     */
    function oneToTwoDim(oneDim,rowSize){
        var newArr = [];
        for (var i=0; i<oneDim.length; i+=rowSize) {
            newArr.push(oneDim.slice(i, i+rowSize));
        }
        return newArr;
//        var twoDim=[];
//        for(var i=0;i<Math.ceil(oneDim.length/rowSize);i++){
//            twoDim[i]=[];
//            for(var j=0;(j<Math.min(rowSize,oneDim.length))&&( i*rowSize+j<oneDim.length);j++){
//                twoDim[i][j] = {};
//                twoDim[i][j] = oneDim[i * rowSize + j];
//            }
//        }
//        return twoDim;
    }
}

skiBootService.$inject=['$http'];
function skiBootService($http) {

    return {
        getBySQL: getBySQL
    };

    function getBySQL(SQLStatement) {
//        $http.get("http://localhost:8080/dbInit");
        return $http.get("http://localhost:8080/data",
            {
                params:{SQL: SQLStatement}
            })
            .then(getBySQLComplete)
            .catch(getBySQLFailed);

        function getBySQLComplete(response) {
            return response.data;
        };

        function getBySQLFailed(error) {
            consolelog(error);
        };

    }
}

