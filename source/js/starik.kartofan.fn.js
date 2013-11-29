$.pluck = function(arr, key) { 
    return $.map(arr, function(e) { return e[key]; }) 
}