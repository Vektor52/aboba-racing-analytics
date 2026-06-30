const ACC_CARS = {

    1: "Porsche 991 GT3 R",
    2: "Mercedes AMG GT3",
    3: "Ferrari 488 GT3",
    4: "Audi R8 LMS",
    5: "Lamborghini Huracan GT3",
    6: "McLaren 650S GT3",
    7: "Nissan GT-R Nismo GT3",
    8: "BMW M6 GT3",
    9: "Bentley Continental GT3 2018",
    10: "Porsche 991 II GT3 Cup",
    11: "Nissan GT-R Nismo GT3 2018",
    12: "Bentley Continental GT3 2016",
    13: "Aston Martin V12 Vantage GT3",
    14: "Lamborghini Gallardo R-EX",
    15: "Jaguar G3",
    16: "Lexus RC F GT3",
    17: "Lamborghini Huracan ST",
    18: "Audi R8 LMS Evo",
    19: "AMR V8 Vantage GT3",
    20: "Honda NSX GT3",
    21: "Lamborghini Huracan Evo GT3",
    22: "McLaren 720S GT3",
    23: "Porsche 911 II GT3 R",
    24: "Ferrari 488 GT3 Evo",
    25: "Mercedes AMG GT3 Evo",
    26: "Honda NSX GT3 Evo",
    27: "McLaren 720S GT3 Evo",
    28: "Porsche 992 GT3 Cup",
    29: "BMW M4 GT3",
    30: "Audi R8 LMS Evo II",
    31: "Ferrari 296 GT3",
    32: "Porsche 992 GT3 R",
    33: "Lamborghini Huracan Evo2",
    34: "Mercedes AMG GT3 Evo 2022",
    35: "BMW M4 GT3 2022",
    36: "Ford Mustang GT3"
};

function getCarName(carModel)
{
    return ACC_CARS[carModel] || ("Model " + carModel);
}