import {useQuery} from "@tanstack/react-query";
import {searchUnsplashImage,isUnsplashConfigured} from "@/services/unsplash";
export function useUnsplashImage(query,enabled=true){return useQuery({queryKey:["unsplash",query],queryFn:()=>searchUnsplashImage(query),enabled:enabled&&isUnsplashConfigured()&&Boolean(query),staleTime:Infinity,retry:false});}
