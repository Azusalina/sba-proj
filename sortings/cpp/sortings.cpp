#include <iostream>
#include <algorithm>
#include <vector>



//asc order
void selection_sort(std::vector<double>& arr){
    for (int i=arr.size()-1;i>0;i--){
    auto max=std::max_element(arr.begin(),arr.begin()+i+1);
    auto idx=std::distance(arr.begin(),max);
    std::swap(arr[i],arr[idx]);
    }

}


//asc
void bubble_sort(std::vector<double>&arr){
    if(arr.size()>1){
        for (int a=0;a<arr.size()-1;a++){
            bool status=false;
            for (int i=0;i<arr.size()-1-a;i++){
                if (arr[i]>arr[i+1]){
                    std::swap(arr[i],arr[i+1]);
                    status=true;
                }
            }
            if(!status)break;
        }
    }  
}
//asc




void merge_sort(std::vector<double>& arr){
    int width=1;
    int n=arr.size();
    while (width<n){
        for (int i=0;i<n;i+=2*width){
            int start=i;
            int mid=std::min(i+width,n);
            int end=std::min(i+2*width,n);
            std::vector<double>left(arr.begin()+start,arr.begin()+mid);
            std::vector<double>right(arr.begin()+mid,arr.begin()+end);

            int p1=0;
            int p2=0;
            int k=start;
            while (p1<left.size() && p2<right.size()){
                if (left[p1]<=right[p2]){
                    arr[k]=left[p1];
                    p1+=1;
                    k+=1;
                }else{
                    arr[k]=right[p2];
                    p2+=1;
                    k+=1;
                }
            }

            while (p1<left.size()){
                arr[k]=left[p1];
                k+=1;
                p1+=1;
            }
            while (p2<right.size()){
                arr[k]=right[p2];
                k+=1;
                p2+=1;
            }
            
        }
        width*=2;
    }
    
}


int main(){
    return 0;
}