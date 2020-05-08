package db.mysql;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import db.DBConnection;
import entity.Item;
import entity.Item.ItemBuilder;
import external.TicketMasterAPI;

public class MySQLConnection implements DBConnection {
	private Connection conn;
	public MySQLConnection() {
		try {
	  		Class.forName("com.mysql.cj.jdbc.Driver").getConstructor().newInstance();
	  		conn = DriverManager.getConnection(MySQLDBUtil.URL);
	  		
	  	} 
		catch (Exception e) {
	  		e.printStackTrace();
	  	}
	}
	
	@Override
	public void close() {
		if (conn != null) {
	  		 try {
	  			 conn.close();
	  		 } catch (Exception e) {
	  			 e.printStackTrace();
	  		 }
	  	 }
	}

	@Override
	public void setFavoriteItems(String userId, List<String> itemIds) {
		if(conn == null) {
			System.err.println("DB connection failed");
			return;
		}
		try {
			String sql = "INSERT IGNORE INTO history(user_id, item_id) VALUES(?, ?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			for(String itemId: itemIds) {
				ps.setString(2, itemId);
				ps.execute();
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void unsetFavoriteItems(String userId, List<String> itemIds) {
		if(conn == null) {
			System.err.println("DB connection failed");
			return;
		}
		try {
			String sql = "DELETE FROM history WHERE user_id = ? AND item_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			for(String itemId: itemIds) {
				ps.setString(2, itemId);
				ps.execute();
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public Set<String> getFavoriteItemIds(String userId) {
		if(conn == null) {
			return new HashSet<>();
		}
		Set<String> favoriteItemIds = new HashSet<>();
		try {
			String sql = "SELECT item_id FROM history WHERE user_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			ResultSet rs = ps.executeQuery();
			while(rs.next()) {
				String itemId = rs.getString("item_id");
				favoriteItemIds.add(itemId);
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
		return favoriteItemIds;
	}
	
	@Override
	public Set<Item> getFavoriteItems(String userId) {
		// userId -> find all itemIds in history table by method "getFavoriteItemIds"
		// itemId -> find all items in item table in this method 
		// itemId -> find all categories in category table by method "getCategories"
		if(conn == null) {
			return new HashSet<>();
		}
		Set<Item> favoriteItems = new HashSet<>();
		Set<String> itemIds = getFavoriteItemIds(userId);
		try {
			String sql = "SELECT * FROM items WHERE item_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			for(String itemId: itemIds) {
				ps.setString(1, itemId);
				ResultSet rs = ps.executeQuery();
				ItemBuilder builder = new ItemBuilder();
				while(rs.next()) {
					builder.setItemId(rs.getString("item_id"));
					builder.setName(rs.getString("name"));
					builder.setAddress(rs.getString("address"));
					builder.setImageUrl(rs.getString("image_url"));
					builder.setUrl(rs.getString("url"));
					builder.setCategories(getCategories(itemId));
					builder.setDistance(rs.getDouble("distance"));
					builder.setRating(rs.getDouble("rating"));
					favoriteItems.add(builder.build());
				}
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
		return favoriteItems;
	}

	@Override
	public Set<String> getCategories(String itemId) {
		if(conn == null) {
			return null;
		}
		Set<String> categories = new HashSet<>();
		try {
			String sql = "SELECT category from categories WHERE item_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, itemId);
			ResultSet rs = ps.executeQuery();
			while(rs.next()) {
				String category = rs.getString("category");
				categories.add(category);
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
		return categories;
	}

	@Override
	public List<Item> searchItems(double lat, double lon, String term) {
		TicketMasterAPI ticketMasterAPI = new TicketMasterAPI();
		List<Item> items = ticketMasterAPI.search(lat, lon, term);
		for(Item item: items) {
			//System.out.println("saveItem");
			saveItem(item);
		}
		return items;
	}

	@Override
	public void saveItem(Item item) {
		if(conn == null) {
			System.err.println("DBConnection failed");
			return;
		}
		try {
			//System.out.println("insert into table items");
			String sql = "INSERT IGNORE INTO items VALUES(?, ?, ?, ?, ?, ?, ?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, item.getItemId());
	  		ps.setString(2, item.getName());
	  		ps.setDouble(3, item.getRating());
	  		ps.setString(4, item.getAddress());
	  		ps.setString(5, item.getImageUrl());
	  		ps.setString(6, item.getUrl());
	  		ps.setDouble(7, item.getDistance());
	  		ps.execute();
	  		
	  		//System.out.println("insert into table categories");
	  		sql = "INSERT IGNORE INTO categories VALUES(?, ?)";
	  		ps = conn.prepareStatement(sql);
	  		ps.setString(1, item.getItemId());
	  		for(String category: item.getCategories()) {
		  		ps.setString(2, category);
		  		ps.execute();
	  		}
 		} 
		catch (Exception e) {
 			e.printStackTrace();
 		}
	}

	@Override
	public String getFullname(String userId) {
		if(conn == null) {
			System.out.println("DB connection failed");
			return "";
		}
		String name = "";
		try {
			String sql = "SELECT first_name, last_name from users WHERE user_id = ?";
			PreparedStatement st = conn.prepareStatement(sql);
			st.setString(1, userId);
			ResultSet rs = st.executeQuery();
			while(rs.next()) {
				name = rs.getString("first_name") + " " + rs.getString("last_name");
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
		return name;
	}

	@Override
	public boolean verifyLogin(String userId, String password) {
		if(conn == null) {
			System.out.println("DB connection failed");
			return false;
		}
		String password_in_database = "";
		try {
			String sql = "SELECT password from users WHERE user_id = ?";
			PreparedStatement st = conn.prepareStatement(sql);
			st.setString(1, userId);
			ResultSet rs = st.executeQuery();
			while(rs.next()) {
				password_in_database = rs.getString("password");
			}
		} 
		catch(Exception e) {
			e.printStackTrace();
		}
		// System.out.println("password_in_database = " + password_in_database + ", password = " + password);
		return password_in_database.equals(password);
	}
	
	@Override
	public boolean registerUser(String userId, String password, String firstname, String lastname) {
		if(conn == null) {
			System.out.println("DB connection failed");
			return false;
		}
		try {
			String sql = "INSERT IGNORE INTO users VALUES(?, ?, ?, ?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			ps.setString(2, password);
			ps.setString(3, firstname);
			ps.setString(4, lastname);
			return ps.executeUpdate() == 1;
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

}
