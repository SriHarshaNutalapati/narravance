async function fetchData(params){
    const base_url = "http://127.0.0.1:5000/api/";
    try {
        let params_keys = Object.keys(params);
        if(!params_keys.includes("headers")){
            params["headers"] = {
                "Content-Type": "application/json",
            }
        }
        if(!params_keys.includes("method")){
            params["method"] = "GET"
        }
        const response = await fetch(`${base_url+params.url}`, params);
    
        if (!response.ok) {
            throw new Error(response);
        }
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

export default fetchData;