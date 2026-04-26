import { BASE_API_URL } from "../constants";

/**
 * 
 * @param {*} message 
 * @param {*} history 
 * @returns 
 * 
 * Non-streaming chat functions 
 * Sends a message and returns the complete response
 */
export async function chatApi(message, history){
   try {
      const response = await fetch (`${BASE_API_URL}/chat`,
        {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({message, history})
        }
      )

      if(!response.ok){
        throw new Error(`HTTP Error! status: ${response.status}`)
      }

      return await response.json()
   } catch (error) {
      console.error("Fetch error", error)
   }
}


/**
 * Streaming Chat functions
 * Yields chunks of the response as they arrive
 */

export async function* streamApi(message, history){
   const response = await fetch(`${BASE_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({message, history})
   })

   if (!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`)
   }

   const reader = response.body?.getReader();
   if(!reader){
      throw new Error("Response body is not iterable");
   }

   const decoder = new TextDecoder()
   let buffer = ""

   while(true){
      const{done, value} = await reader.read();
      if(done) break;

      buffer += decoder.decode(value, {stream: true});

      const lines = buffer.split("\n");
      buffer = lines.pop() || ""

      for(const line of lines){
         if(line.startsWith('data: ')){
            try {
               const jsonStr = line.slice(6)
               const data = JSON.parse(jsonStr)

               if(data.chunk){
                  yield data.chunk
               }
            } catch (error) {
               console.error("Error parsing SSE data:", error);
            }
         }
      }
   }
}
