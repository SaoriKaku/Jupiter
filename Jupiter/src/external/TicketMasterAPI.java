package external;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import entity.Item;
import entity.Item.ItemBuilder;

public class TicketMasterAPI {
	private static final String URL = "https://app.ticketmaster.com/discovery/v2/events.json";
	private static final String DEFAULT_KEYWORD = ""; // no restriction
	private static final String API_KEY = "sWpPtmciRAZg1Ac7LUuAN9JVOU8QY5Q2";

	public List<Item> search(double lat, double lon, String keyword) {
		if(keyword == null) {
			keyword = DEFAULT_KEYWORD;
		}
		try { // L A -> L%20A
			keyword = URLEncoder.encode(keyword, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} 
		String query = String.format("apikey=%s&latlong=%s,%s&keyword=%s&radius=%s", 
				API_KEY, lat, lon, keyword, 50);
		String url = URL + "?" + query;
		try {
			HttpURLConnection connection = (HttpURLConnection)new URL(url).openConnection();
			connection.setRequestMethod("GET");
			int responseCode = connection.getResponseCode();
			System.out.println("Sending request to url: " + url);
			System.out.println("Response code: " + responseCode);
			if(responseCode != 200) {
				return new ArrayList<>();
			}
			BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
			String line;
			StringBuilder response = new StringBuilder();
			while((line = reader.readLine()) != null) {
				response.append(line);
			}
			reader.close();
			JSONObject obj = new JSONObject(response.toString());
			if(!obj.isNull("_embedded")) {
				JSONObject embedded = obj.getJSONObject("_embedded");
				return getItemList(embedded.getJSONArray("events"));
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return new ArrayList<Item>();
	}
	
	private void queryAPI(double lat, double lon) {
		List<Item> events = search(lat, lon, null);
		for(Item event: events) {
			System.out.println(event.toJSONObject());
		}
	}
	
	// convert JSONArray to a list of item objects.
	private List<Item> getItemList(JSONArray events) throws JSONException {
		List<Item> itemList = new ArrayList<>();
		for(int i = 0; i < events.length(); i++) {
			JSONObject event = events.getJSONObject(i);
			ItemBuilder builder = new ItemBuilder();
			if(!event.isNull("id")) {
				builder.setItemId(event.getString("id"));
			}
			if(!event.isNull("name")) {
				builder.setName(event.getString("name"));
			}
			if(!event.isNull("url")) {
				builder.setUrl(event.getString("url"));
			}
			if(!event.isNull("distance")) {
				builder.setDistance(event.getDouble("distance"));
			}
			builder.setAddress(getAddress(event)).setCategories(getCategories(event)).setImageUrl(getImageUrl(event));
			itemList.add(builder.build());
		}
		return itemList;
	}
	
	/* _embedded -> events[i] -> _embedded -> venues[i] -> address -> line1, line2, line3(String)
	                curr pos                                    -> city -> name(String)
	   unmark = object
	 */
	private String getAddress(JSONObject event) throws JSONException {
		if(!event.isNull("_embedded")) {
			JSONObject embedded = event.getJSONObject("_embedded");
			if(!embedded.isNull("venues")) {
				JSONArray venues = embedded.getJSONArray("venues");
				for(int i = 0; i < venues.length(); i++) {
					JSONObject venue = venues.getJSONObject(i);
					StringBuilder sb = new StringBuilder();
					if(!venue.isNull("address")) {
						JSONObject address = venue.getJSONObject("address");
						if(!address.isNull("line1")) {
							sb.append(address.getString("line1"));
						}
						if(!address.isNull("line2")) {
							sb.append(",");
							sb.append(address.getString("line2"));
						}
						if(!address.isNull("line3")) {
							sb.append(",");
							sb.append(address.getString("line3"));
						}
					}
					if(!venue.isNull("city")) {
						JSONObject city = venue.getJSONObject("city");
						sb.append(',');
						sb.append(city.getString("name"));	
					}
					String result = sb.toString();
					if(!result.isEmpty()) {
						return result;
					}
				}
			}
		}
		return "";
	}
	
	/* _embedded -> events(array) -> images(array) -> url(String)
                    curr pos        
       unmark = object
     */
	private String getImageUrl(JSONObject event) throws JSONException {
		if(!event.isNull("images")) {
			JSONArray images = event.getJSONArray("images");
			for(int i = 0; i < images.length(); i++) {
				JSONObject image = images.getJSONObject(i);
				if(!image.isNull("url")) {
					return image.getString("url");
				}
			}
		}
		return "";
	}
	
	/* _embedded -> events(array) -> classifications(array) -> segment -> name(String)
                    curr pos        
     unmark = object
     */
	private Set<String> getCategories(JSONObject event) throws JSONException {
		Set<String> categories = new HashSet<>();
		if(!event.isNull("classifications")) {
			JSONArray classifications = event.getJSONArray("classifications");
			for(int i = 0; i < classifications.length(); i++) {
				JSONObject classification = classifications.getJSONObject(i);
				if(!classification.isNull("segment")) {
					JSONObject segment = classification.getJSONObject("segment");
					if(!segment.isNull("name")) {
						categories.add(segment.getString("name"));
					}
				}
			}
		}
		return categories;
	}
	
	public static void main(String[] args) {
		TicketMasterAPI tmApi = new TicketMasterAPI();
		tmApi.queryAPI(29.682684, -95.295410);
	}

}
