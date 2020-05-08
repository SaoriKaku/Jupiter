package recommendation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import db.DBConnection;
import db.DBConnectionFactory;
import db.mysql.MySQLConnection;
import entity.Item;


// Recommendation based on geo distance and similar categories.
public class GeoRecommendation {
	
	public List<Item> recommendationItems(String userId, double lat, double lon) {
		List<Item> recommendationItems = new ArrayList<>();
		// step1, get all favorited itemIds
		DBConnection connection = DBConnectionFactory.getConnection();
		Set<String> favoriteItemIds = connection.getFavoriteItemIds(userId);
		// step2, get all categories, sort by count
		Map<String, Integer> allCategories = new HashMap<>();
		for(String itemId: favoriteItemIds) {
			Set<String> categories = connection.getCategories(itemId);
			for(String category: categories) {
				allCategories.put(category, allCategories.getOrDefault(category, 0) + 1);
			}
		}
		List<Entry<String, Integer>> categoryList = new ArrayList<>(allCategories.entrySet());
		Collections.sort(categoryList, (Entry<String, Integer> e1, Entry<String, Integer> e2) -> {
			return Integer.compare(e2.getValue(), e1.getValue());
		});
		// step3, search base on category, filter out favorite items
		Set<String> visitedItemIds = new HashSet<>();
		for(Entry<String, Integer> category: categoryList) {
			List<Item> items = connection.searchItems(lat, lon, category.getKey());
			for(Item item: items) {
				if(!favoriteItemIds.contains(item.getItemId()) && !visitedItemIds.contains(item.getItemId())) {
					recommendationItems.add(item);
					visitedItemIds.add(item.getItemId());
				}
			}
		}
		connection.close();
		return recommendationItems;
	}
}
