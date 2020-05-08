Personalized Recommendation Engine for Events

1. Front End: implemented an interactive web application (HTML, CSS, JavaScript, AJAX) for users to look for events, purchase tickets; improved personalized recommendation based on search history and favorite records.
2. Back End: created Java Servlets with RESTful APIs to handle HTTP requests and responses.
3. Built relational databases MySQL to store real event information (price, location, category, etc.) for consistency and migrated to NoSQL database MongoDB for better scalability.
4. Researched multiple recommendation algorithms (e.g., content-based recommendation) to implement recommendations and evaluate performance (precision vs. recall vs. cost).
5. Deployed to Amazon EC2 to handle 150 queries per second tested by Apache JMeter.

A simple sample to present Jupiter
1. Firstly, you need to login.
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic1%20login.png)

2. If you don't have an account, then register.
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic2%20register.png)

3. After register, you will see nearby by default. They are events searching from TicketMaster API with your location.
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic3%20nearby.png)

4. You can check you favorite events. It should be empty. 
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic4%20favorite.png)

5. There are no recommendation events. Because the recommendation events depend on your favorite events. 
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic5%20recommend.png)

6. Then you could try to add an event to your favorite list. Let's take the first one.
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic6%20favorite.png)

7. You go to the favorite events. The first event we add is there.
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic7%20favorite.png)

8. Finally, you will find events we recommend to you based on your favorite events. 
![image](https://github.com/SaoriKaku/Jupiter/blob/master/images/pic8%20recommend.png)

Thank you for reading!
