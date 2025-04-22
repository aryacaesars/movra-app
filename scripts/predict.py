import sys
import json
import numpy as np
from scipy import stats
import csv
import requests
from io import StringIO

def fetch_csv_data():
    """
    Fetch CSV data from the URL
    """
    url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jmlh_kndrn_brmtr_brdskn_jns_kndrn_d_kt_tskmly-4QBEOLKgcwHboT01ehrH3QsMwC9eXb.csv"
    response = requests.get(url)
    response.raise_for_status()  # Raise an exception for HTTP errors
    
    # Parse CSV
    csv_data = StringIO(response.text)
    reader = csv.DictReader(csv_data)
    records = list(reader)
    
    return records

def linear_regression(x, y, predict_years):
    """
    Perform linear regression and predict values for given years
    """
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
    predictions = []
    
    for year in predict_years:
        predicted_count = round(slope * year + intercept)
        predictions.append({
            "year": year,
            "count": str(predicted_count)
        })
    
    return predictions, slope, intercept, r_value**2

def newton_interpolation(x, y, predict_years):
    """
    Perform Newton's polynomial interpolation
    """
    n = len(x)
    # Calculate divided differences table
    coef = np.zeros([n, n])
    coef[:,0] = y
    
    for j in range(1, n):
        for i in range(n-j):
            coef[i][j] = (coef[i+1][j-1] - coef[i][j-1]) / (x[i+j] - x[i])
    
    # Predict using Newton's interpolation formula
    predictions = []
    for year in predict_years:
        result = coef[0][0]
        for j in range(1, n):
            term = coef[0][j]
            for i in range(j):
                term = term * (year - x[i])
            result = result + term
        
        predictions.append({
            "year": year,
            "count": str(round(result))
        })
    
    return predictions

def main():
    # Read input from command line
    input_data = json.loads(sys.argv[1])
    vehicle_type = input_data["vehicleType"]
    target_year = input_data["year"]
    
    # Fetch CSV data
    records = fetch_csv_data()
    
    # Filter data for the selected vehicle type
    filtered_data = [record for record in records if record["jenis_kendaraan"] == vehicle_type]
    
    if not filtered_data:
        print(json.dumps({"error": "Data tidak ditemukan untuk jenis kendaraan yang dipilih"}))
        sys.exit(1)
    
    # Extract historical data
    historical_data = [
        {"year": int(record["tahun"]), "count": record["jumlah_kendaraan"]}
        for record in filtered_data
    ]
    
    # Sort by year
    historical_data.sort(key=lambda x: x["year"])
    
    # Extract x and y values
    x = [item["year"] for item in historical_data]
    y = [int(item["count"]) for item in historical_data]
    
    # Years to predict
    predict_years = list(range(2024, 2029))
    
    # Perform linear regression
    linear_predictions, slope, intercept, r_squared = linear_regression(x, y, predict_years)
    
    # Perform Newton's interpolation if we have enough data points
    if len(x) >= 3:
        newton_predictions = newton_interpolation(x, y, predict_years)
        
        # Average the predictions from both methods
        combined_predictions = []
        for i, year in enumerate(predict_years):
            avg_count = round((int(linear_predictions[i]["count"]) + int(newton_predictions[i]["count"])) / 2)
            combined_predictions.append({
                "year": year,
                "count": str(avg_count)
            })
    else:
        # If not enough data points for interpolation, use linear regression only
        combined_predictions = linear_predictions
    
    # Filter predictions based on requested year
    filtered_predictions = [p for p in combined_predictions if p["year"] >= target_year]
    
    # Prepare response
    response = {
        "vehicleType": vehicle_type,
        "year": target_year,
        "historicalData": historical_data,
        "predictions": filtered_predictions,
        "linearRegression": {
            "slope": slope,
            "intercept": intercept,
            "rSquared": r_squared
        },
        "method": "Kombinasi Regresi Linier dan Interpolasi Polinom Newton" if len(x) >= 3 else "Regresi Linier"
    }
    
    # Output as JSON
    print(json.dumps(response))

if __name__ == "__main__":
    main()
