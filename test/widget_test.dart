import 'package:flutter_test/flutter_test.dart';
import 'package:linkdrop/main.dart';

void main() {
  testWidgets('LinkDrop smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const LinkDropApp());
    expect(find.text('LinkDrop'), findsWidgets);
  });
}
